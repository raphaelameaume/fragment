import { posix, sep, resolve, dirname, extname, join } from 'path';
import { readFileSync, utimes } from 'fs';
import glslify from 'glslify';
import log from '../log.js';
import { readFile } from 'fs/promises';

export default function hotShaderReload({ wss, watch = false }) {
	const fileRegex = /\.(?:frag|vert|glsl|vs|fs)$/;
	const includeRegex = /#include(\s+([^\s<>]+));?/gi;
	const commentRegex =
		/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
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

	const dependencies = new Map();
	const shaders = [];

	function getUnixPath(shaderPath) {
		return shaderPath.split(sep).join(posix.sep);
	}

	/**
	 *
	 * @param {string} shaderSource
	 * @param {string} shaderPath
	 * @param {string[]} deps
	 * @returns
	 */
	function resolveDependencies(shaderSource, shaderPath, deps = []) {
		// remove comments
		shaderSource = shaderSource.replace(commentRegex, '');

		let unixPath = getUnixPath(shaderPath);
		let directory = dirname(unixPath);

		if (includeRegex.test(shaderSource)) {
			const currentDirectory = directory;

			shaderSource = shaderSource.replace(
				includeRegex,
				(_, chunkPath) => {
					chunkPath = chunkPath
						.trim()
						.replace(/^(?:"|')?|(?:"|')?;?$/gi, '');

					if (!chunkPath.indexOf('/')) {
						chunkPath = `${base}/${chunkPath}`;
					}

					const directoryIndex = chunkPath.lastIndexOf('/');
					directory = currentDirectory;

					if (directoryIndex !== -1) {
						directory = resolve(
							directory,
							chunkPath.slice(0, directoryIndex + 1),
						);
						chunkPath = chunkPath.slice(
							directoryIndex + 1,
							chunkPath.length,
						);
					}

					let shader = resolve(directory, chunkPath);
					let extension = 'glsl';

					if (!extname(shader)) shader = `${shader}.${extension}`;

					const shaderPath = getUnixPath(shader);

					if (!dependencies.has(shaderPath)) {
						deps.push(shaderPath);
						dependencies.set(shaderPath, []);
					}

					const parents = dependencies.get(shaderPath);

					if (!parents.includes(unixPath)) {
						console.log('new Dependency detected', shader);
						server.watcher.add(shader);

						if (dependencies.has(unixPath)) {
							parents.push(...dependencies.get(unixPath));
						} else {
							parents.push(unixPath);
						}
					} else {
						log.warning(
							`Duplicated import found in '${shaderPath}'. Include was skipped.`,
						);
						console.log(`'${shader}' was included multiple times.`);

						return '';
					}

					const { code: chunkCode, deps: chunkDeps } =
						resolveDependencies(
							readFileSync(shader, 'utf8'),
							shader,
							deps,
						);

					return chunkCode;
				},
			);
		}

		return {
			code: shaderSource.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n'),
			deps,
		};
	}

	function compileGLSL(shaderSource, shaderPath) {
		if (!shaders.includes(shaderPath)) {
			shaders.push(shaderPath);
		}

		dependencies.forEach((shadersPaths, dependency) => {
			const shadersList = shadersPaths.filter((p) => p !== shaderPath);
			dependencies.set(dependency, shadersList);
		});

		dependencies.forEach((shadersPaths, dependency) => {
			if (shadersPaths.length === 0) {
				server.watcher.unwatch(dependency);
				dependencies.delete(dependency);
			}
		});

		let { code, deps } = resolveDependencies(shaderSource, shaderPath);
		code = glslify(code, {
			basedir: process.cwd(),
		});
		code = addShaderFilepath(code, shaderPath);

		return { code, deps };
	}

	/** @type import('vite').ViteDevServer */
	let server;

	return {
		name: 'hot-shader-reload',
		config: () => ({
			optimizeDeps: {
				esbuildOptions: {
					loader: {
						'.frag': 'text',
						'.vert': 'text',
						'.glsl': 'text',
						'.fs': 'text',
						'.vs': 'text',
					},
				},
			},
		}),
		configureServer(_server) {
			server = _server;
		},
		handleHotUpdate: async ({ modules, file, read }) => {
			if (fileRegex.test(file)) {
				let unixPath = getUnixPath(file);
				if (shaders.includes(unixPath)) {
					let source = await read();
					let { code: glsl } = compileGLSL(source, unixPath);

					wss.send({
						type: 'custom',
						event: 'shader-update',
						data: {
							filepath: unixPath,
							source: glsl,
						},
					});
				} else {
					if (dependencies.has(unixPath)) {
						const shadersList = dependencies.get(unixPath);

						const sources = await Promise.all(
							shadersList.map((shader) => {
								return readFile(shader, 'utf-8');
							}),
						);

						shadersList.forEach((shader, index) => {
							let source = sources[index];
							let { code: glsl } = compileGLSL(source, shader);

							wss.send({
								type: 'custom',
								event: 'shader-update',
								data: {
									filepath: shader,
									source: glsl,
								},
							});
						});
					}
				}
			}
		},
		transform(source, id) {
			if (!fileRegex.test(id)) return;

			let { code: glsl, deps } = compileGLSL(source, id);

			return {
				code: `export default ${JSON.stringify(glsl)}`,
				map: null, // provide source map if available
			};
		},
	};
}
