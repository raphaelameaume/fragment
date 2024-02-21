import path from 'node:path';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import glslify from 'glslify';
import { log, dim, green, yellow } from '../log.js';

/**
 * @typedef {Object} ShaderUpdate
 * @property {string} filepath - The path of the shader on the filesystem
 * @property {string} source - The source code of the shader
 * @property {boolean} nohsr - Whether the shader can be injected on the fly or if the sketch needs to be fully reloaded
 * @property {string[]} warnings - Indicates whether the Wisdom component is present.
 */

/**
 * Resolve shader include directives and send shader code via WebSocket
 * @param {object} params
 * @param {string} [params.cwd=process.cwd()] - Current working directory
 * @param {import('ws').WebSocketServer} params.wss
 * @returns {import('vite').Plugin}
 */
export default function hotShaderReplacement({ cwd = process.cwd(), wss }) {
	const name = 'fragment-plugin-hsr';
	const prefix = log.prefix(name);
	const fileRegex = /\.(?:frag|vert|glsl|vs|fs)$/;
	const includeRegex = /#include(\s+([^\s<>]+));?/gi;
	const ignoreRegex = /^(?:\/|\*)*\s*@fragment-nohsr/;
	const commentRegex =
		/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
	const base = process.cwd().split(path.sep).join(path.posix.sep);

	let dependencies = new Map();
	let shaders = [];
	let modulesToReload = [];

	function reloadSketch() {
		const clone = [...modulesToReload];

		modulesToReload = [];

		if (clone.length > 0) {
			const { file } = clone[0];
			const filepath = path.relative(cwd, file);
			log.message(`${green(`hmr update`)} /${filepath}`);

			server.ws.send({
				type: 'custom',
				event: 'sketch-update',
				data: {
					file,
					filepath,
					cwd,
				},
			});
		}

		return clone;
	}

	function addShaderFilepath(shaderSource, shaderPath) {
		let keyword = `void main`;
		let shaderParts = shaderSource.split(keyword);
		let hint = `// <filepath://${shaderPath}>`;

		return `${shaderParts[0]}
${hint}
${keyword}${shaderParts[1]}
        `;
	}

	function getUnixPath(shaderPath) {
		return shaderPath.split(path.sep).join(path.posix.sep);
	}

	function compileGLSL(shaderSource, shaderPath) {
		// test if shader source contains hint to avoid shader injection
		const nohsr = ignoreRegex.test(shaderSource);

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
		 * @returns {}
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
			let directory = path.dirname(parentUnixPath);

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
							directory = path.resolve(
								directory,
								chunkPath.slice(0, directoryIndex + 1),
							);
							chunkPath = chunkPath.slice(
								directoryIndex + 1,
								chunkPath.length,
							);
						}

						let chunkResolvedPath = path.resolve(
							directory,
							chunkPath,
						);
						let extension = 'glsl';

						if (!path.extname(chunkResolvedPath))
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
							const message = `Dependency is already included in ${shaderPath}.\nInclude was skipped to avoid errors.`;

							warnings.push({
								type: 'duplicated dependency',
								message,
								importer: parentPath,
								url: chunkResolvedPath,
								location: {
									lineText: `#include ${include}`,
								},
							});

							return '';
						}

						try {
							const chunkSource = fs.readFileSync(
								chunkResolvedPath,
								'utf8',
							);

							const { code: chunkCode } = resolveDependencies(
								chunkSource,
								chunkResolvedPath,
								deps,
								warnings,
							);

							const prefix = server
								? `//#include ${include}\n`
								: ``;

							return `${prefix}\n${chunkCode}`;
						} catch (error) {
							if (error.code === 'ENOENT') {
								warnings.push({
									type: 'not found',
									message: `Cannot find ${chunkResolvedPath}`,
									importer: parentPath,
									url: chunkResolvedPath,
									location: {
										lineText: `#include ${include}`,
									},
								});
							}

							return ``;
						}
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
			const { location } = warning;
			const line = 1;
			const column = 4;
			log.message(`${yellow(warning.type)} ${warning.importer}`, prefix);
			console.log();
			console.log(`  ${dim(location.lineText)}`);
			console.log();
			console.log(warning.message);
			console.log();
		});

		return { code, deps, warnings, nohsr };
	}

	/**
	 * Reload shaders after changes via custom Websocket or Vite HMR (sketch reload)
	 * @param {ShaderUpdate[]} shaderUpdates
	 */
	function reloadShaders(shaderUpdates) {
		const shadersNeedReload = shaderUpdates.filter(
			(shaderUpdate) => shaderUpdate.nohsr,
		);

		if (shadersNeedReload.length > 0) {
			shadersNeedReload.forEach((shaderUpdate) => {
				log.message(
					`${yellow('hsr ignore')} /${path.relative(cwd, shaderUpdate.filepath)}`,
				);
			});

			return reloadSketch();
		} else {
			shaderUpdates.forEach((shaderUpdate) => {
				log.message(
					`${green('hsr update')} /${path.relative(cwd, shaderUpdate.filepath)}`,
				);
			});

			wss.send({
				type: 'custom',
				event: 'shader-update',
				data: shaderUpdates,
			});

			return [];
		}
	}

	/** @type import('vite').ViteDevServer */
	let server;

	return {
		name: 'fragment-plugin-hsr',
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
			const { moduleGraph } = server;

			if (fileRegex.test(file)) {
				const thisModule = moduleGraph.getModuleById(file);

				if (thisModule) {
					modulesToReload.push(thisModule);
				}

				let unixPath = getUnixPath(file);
				if (shaders.includes(file)) {
					let source = await read();
					let {
						code: glsl,
						warnings,
						nohsr,
					} = compileGLSL(source, file);

					/** @type ShaderUpdate[] */
					const shaderUpdate = {
						filepath: unixPath,
						source: glsl,
						warnings,
						nohsr,
					};

					return reloadShaders([shaderUpdate]);
				} else {
					if (dependencies.has(unixPath)) {
						const shadersList = dependencies.get(unixPath);

						// retrieve modules from module graph
						const moduleNodes = shadersList.map((moduleNode) =>
							moduleGraph.getModuleById(moduleNode),
						);

						// save it as modules to reload to invalidate the top level shaders in case a dependency has been hot updated in between
						modulesToReload.push(...moduleNodes);

						const sources = await Promise.all(
							shadersList.map((shader) => {
								return readFile(shader, 'utf-8');
							}),
						);

						log.message(
							`${yellow(`dependency update`)} /${path.relative(cwd, unixPath)}`,
						);

						/** @type ShaderUpdate[] */
						const shaderUpdates = shadersList.map(
							(shader, index) => {
								let source = sources[index];
								let {
									code: glsl,
									warnings,
									nohsr,
								} = compileGLSL(source, shader);

								return {
									filepath: shader,
									source: glsl,
									warnings: warnings,
									nohsr,
								};
							},
						);

						return reloadShaders(shaderUpdates);
					}
				}

				return [];
			} else if (modulesToReload.length > 0) {
				// only return if some shaders have been updated in between
				// otherwise, returning an empty array would prevent hmr on sketch files
				return reloadSketch();
			}
		},
		transform(source, file) {
			if (!fileRegex.test(file)) return;

			if (!shaders.includes(file)) {
				shaders.push(file);
			}

			let { code: glsl } = compileGLSL(source, file);

			return {
				code: `export default ${JSON.stringify(glsl)}`,
				map: null, // provide source map if available
			};
		},
	};
}
