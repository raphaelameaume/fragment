import path from "path";
import glslify from "glslify";

export default function hotShaderReload({ wss }) {
    const fileRegex = /\.(?:frag|vert|glsl|vs|fs)$/

    function addShaderFilepath(shader, id) {
        let keyword = `void main`;
        let shaderParts = shader.split(keyword);
        let hint = `// <filepath://${id}>`;

        return `${shaderParts[0]}
${hint}
${keyword}${shaderParts[1]}
        `;
    }

    let modulesToReload = [];
    
    return {
        name: 'hot-shader-reload',
        handleHotUpdate: async ({ modules, file, read }) => {
            if (fileRegex.test(file)) {
                let src = await read();
                let source = glslify(src);
                source = addShaderFilepath(source, file);

                wss.send({
                    type: 'custom',
                    event: 'shader-update',
                    data: {
                        filepath: file,
                        source
                    },
                });

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
        transform: (src, id) => {
            if (fileRegex.test(id)) {
                let source = glslify(src);
                source = addShaderFilepath(source, id);

                return {
                    code: `export default ${JSON.stringify(source)}`,
                    map: null // provide source map if available
                }
            }
        }
    };
}
