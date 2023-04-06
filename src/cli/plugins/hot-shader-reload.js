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

		/**
		 *
		 * @param {string} parentSource
		 * @param {string} parentPath
		 * @param {string[]} deps
		 * @returns
		 */
		function resolveDependencies(
			parentSource,
			parentPath,
			deps = [],
			warnings = [],
		) {
			// remove comments
			parentSource = parentSource.replace(commentRegex, '');

			let parentUnixPath = getUnixPath(parentPath);
			let directory = dirname(parentUnixPath);

			if (includeRegex.test(parentSource)) {
				const currentDirectory = directory;

				parentSource = parentSource.replace(
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

						let chunkResolvedPath = resolve(directory, chunkPath);
						let extension = 'glsl';

						if (!extname(chunkResolvedPath))
							chunkResolvedPath = `${chunkResolvedPath}.${extension}`;

						const chunkUnixPath = getUnixPath(chunkResolvedPath);

						if (!dependencies.has(chunkUnixPath)) {
							// first time chunk is detected
							dependencies.set(chunkUnixPath, []);
							server.watcher.add(chunkResolvedPath);
						}

						const parents = dependencies.get(chunkUnixPath);

						if (!parents.includes(shaderPath)) {
							parents.push(shaderPath);
							deps.push(chunkResolvedPath);
						} else {
							const warning = `Duplicated import found in '${parentPath}'. ${chunkResolvedPath} was skipped.`;
							log.warning(warning);

							warnings.push(warning);

							return '';
						}

						const { code: chunkCode } = resolveDependencies(
							readFileSync(chunkResolvedPath, 'utf8'),
							chunkResolvedPath,
							deps,
							warnings,
						);

						return chunkCode;
					},
				);
			}

			return {
				code: parentSource.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n'),
				deps,
				warnings,
			};
		}

		let { code, deps, warnings } = resolveDependencies(
			shaderSource,
			shaderPath,
		);

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

						log.warning(
							`Dependency ${unixPath} has changed. Recompiling shaders`,
						);
						console.log({ shadersList });

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
