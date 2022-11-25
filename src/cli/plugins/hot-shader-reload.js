import { posix, sep, resolve, dirname, extname, join } from "path";
import { readFileSync, utimes } from "fs";
import glslify from "glslify";

export default function hotShaderReload({
    wss,
    watch = false,
}) {
    const fileRegex = /\.(?:frag|vert|glsl|vs|fs)$/;
    const includeRegex = /#include(\s+([^\s<>]+));?/gi;
    const base = process.cwd().split(sep).join(posix.sep);

    function addShaderFilepath(shaderSource, shaderPath) {
        let keyword = `void main`;
        let shaderParts = shaderSource.split(keyword);
        let hint = `// <filepath://${shaderPath}>`;

        return `${shaderParts[0]}
${hint}
${keyword}${shaderParts[1]}
        `;
    }

    let modulesToReload = [];

    const allChunks = new Set();
    const dependentChunks = new Map();
    const duplicatedChunks = new Map();

    const shaders = new Map();
    const dependencyTree = new Map();

    function resolveDependencies(shaderSource, shaderPath) {
        let unixPath = shaderPath.split(sep).join(posix.sep);
        let directory = dirname(unixPath);

        if (shaders.has(shaderPath)) {
            dependencyTree.set(shaderPath, []);
        }

        if (includeRegex.test(shaderSource)) {
            dependencyTree.set(unixPath, []);
            const currentDirectory = directory;

            shaderSource = shaderSource.replace(includeRegex, (_, chunkPath) => {
                chunkPath = chunkPath.trim().replace(/^(?:"|')?|(?:"|')?;?$/gi, '');

                if (!chunkPath.indexOf('/')) {
                    chunkPath = `${base}/${chunkPath}`;
                }

                const directoryIndex = chunkPath.lastIndexOf('/');
                directory = currentDirectory;

                if (directoryIndex !== -1) {
                    directory = resolve(directory, chunkPath.slice(0, directoryIndex + 1));
                    chunkPath = chunkPath.slice(directoryIndex + 1, chunkPath.length);
                }

                let shader = resolve(directory, chunkPath);
                let extension = "glsl";

                if (!extname(shader)) shader = `${shader}.${extension}`;

                server.watcher.add(shader);

                const shaderPath = shader.split(sep).join(posix.sep);
                dependencyTree.get(unixPath)?.push(shaderPath);
                
                return resolveDependencies(
                    readFileSync(shader, 'utf8'),
                    shader,
                );
            });
        }

        return shaderSource.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n');
    }

    function compile(shaderSource, shaderPath) {
        let code = shaderSource;
        code = resolveDependencies(shaderSource, shaderPath);
        code = glslify(code, {
            basedir: process.cwd()
        });
        code = addShaderFilepath(code, shaderPath);

        return code;
    }

    let server;
    
    return {
        name: 'hot-shader-reload',
        config: () => ({
            optimizeDeps: {
                esbuildOptions: {
                    loader: {
                        ".frag": "text",
                        ".vert": "text",
                        ".glsl": "text",
                        ".fs": "text",
                        ".vs": "text",
                    }
                },
            },
		}),
        configureServer(_server) {
            server = _server;
        },
        handleHotUpdate: async ({ modules, file, read }) => {
            if (fileRegex.test(file)) {
                if (shaders.has(file)) {
                    let source = await read();
                    let shaderSource = compile(source, file);

                    wss.send({
                        type: 'custom',
                        event: 'shader-update',
                        data: {
                            filepath: file,
                            source: shaderSource,
                        },
                    });
                } else {
                    for (const [shader, dependencies] of dependencyTree) {
                        if (dependencies.includes(file)) {
                            const now = Date.now();
                            const ts = now / 1e3;
                            utimes(shader, ts, ts, (error) => {
                                if (error) {
                                    console.error(error);
                                }
                            });
                        }
                    }

                }

                // save modules that were handled 
                modulesToReload.push(...modules);

                return [];
            }
            
            // add previous modules that were handled to the list of modules to avoid shader invalidation
            if (modulesToReload.length > 0) {
                const all = [
                    ...modules,
                    ...modulesToReload,
                ];

                modulesToReload = [];

                return all;
            }
        },
        transform: (source, file) => {
            if (fileRegex.test(file)) {
                shaders.set(file, []);

                let shaderSource = compile(source, file);

                return {
                    code: `export default ${JSON.stringify(shaderSource)}`,
                    map: null // provide source map if available
                }
            }
        }
    };
}
