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

	const dependencies = new Map();
	const shaders = [];

	function getUnixPath(shaderPath) {
		return shaderPath.split(sep).join(posix.sep);
	}

	function compileGLSL(shaderSource, shaderPath) {
		if (!shaders.includes(shaderPath)) {
			shaders.push(shaderPath);
		}

		// remove current shader from dependency list before resolving dependencies again
		dependencies.forEach((shadersPaths, dependency) => {
			const shadersList = shadersPaths.filter((p) => p !== shaderPath);
			dependencies.set(dependency, shadersList);
		});

		// if a dependency no longer have any parent shader, we can remove it from the watch
		dependencies.forEach((shadersPaths, dependency) => {
			if (shadersPaths.length === 0) {
				if (server) {
					server.watcher.unwatch(dependency);
				}

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
					(_, include) => {
						include = include.trim();
						let chunkPath = include.replace(
							/^(?:"|')?|(?:"|')?;?$/gi,
							'',
						);

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

							if (server) {
								server.watcher.add(chunkResolvedPath);
							}
						}

						const parents = dependencies.get(chunkUnixPath);

						if (!parents.includes(shaderPath)) {
							parents.push(shaderPath);
							deps.push(chunkResolvedPath);
						} else {
							const message = `Duplicated import found in '${parentPath}'. ${chunkResolvedPath} was skipped.`;
							warnings.push({
								message,
								importer: parentPath,
								url: chunkResolvedPath,
							});

							return '';
						}

						const { code: chunkCode } = resolveDependencies(
							readFileSync(chunkResolvedPath, 'utf8'),
							chunkResolvedPath,
							deps,
							warnings,
						);

						const prefix = server ? `//#include ${include}\n` : ``;

						return `${prefix}\n${chunkCode}`;
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

		if (server) {
			code = addShaderFilepath(code, shaderPath);
		}

		warnings.forEach((warning) => {
			log.warning(warning.message);
		});

		return { code, deps, warnings };
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
					let { code: glsl, warnings } = compileGLSL(
						source,
						unixPath,
					);

					wss.send({
						type: 'custom',
						event: 'shader-update',
						data: [
							{
								filepath: unixPath,
								source: glsl,
								warnings,
							},
						],
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

						const shaderUpdates = shadersList.map(
							(shader, index) => {
								let source = sources[index];
								let { code: glsl, warnings } = compileGLSL(
									source,
									shader,
								);

								return {
									filepath: shader,
									source: glsl,
									warnings: warnings,
								};
							},
						);

						wss.send({
							type: 'custom',
							event: 'shader-update',
							data: shaderUpdates,
						});
					}
				}
			}
		},
		transform(source, id) {
			if (!fileRegex.test(id)) return;

			let { code: glsl } = compileGLSL(source, id);

			return {
				code: `export default ${JSON.stringify(glsl)}`,
				map: null, // provide source map if available
			};
		},
	};
}
