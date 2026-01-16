import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { json } from 'milliparsec';
import { log, green, red } from '../log.js';
import { mkdirp } from '../utils.js';

/**
 *
 * @param {object} [params]
 * @param {string} [cwd=process.cwd()] - Current working directory
 * @param {string} [inlineExportDir] - Directory path used for exports from inline command
 * @param {string} [configExportDir] - Directory path used for exports from config file
 * @returns {import('vite').Plugin}
 */
export default function screenshot({
	cwd = process.cwd(),
	inlineExportDir,
	configExportDir,
} = {}) {
	function resolveDirectory(directoryPath, dirname) {
		return path.isAbsolute(directoryPath)
			? directoryPath
			: path.join(path.join(cwd, dirname), directoryPath);
	}

	function resolveExportDirectory(exportDir, dirname) {
		let directory;

		if (inlineExportDir) {
			if (!inlineExportDirPath) {
				inlineExportDirPath = resolveDirectory(inlineExportDir, '');
			}

			directory = inlineExportDirPath;
		} else if (exportDir) {
			directory = resolveDirectory(exportDir, dirname);
		} else if (configExportDir) {
			if (!configExportDirPath) {
				configExportDirPath = resolveDirectory(configExportDir, '');
			}

			directory = configExportDirPath;
		} else {
			directory = cwd;
		}

		return directory;
	}

	let inlineExportDirPath;
	let configExportDirPath;

	return {
		name: 'save',
		configureServer(server) {
			const payloadLimit = 100 * 1024 * 1024; // 100mb
			server.middlewares.use(
				json({
					payloadLimit,
				}),
			);
			server.middlewares.use('/save', async (req, res, next) => {
				if (req.method === 'POST') {
					const { files } = req.body;

					try {
						const filepaths = [];

						for (let i = 0; i < files.length; i++) {
							const { filename, data, encoding, exportDir } =
								files[i];

							let directory = resolveExportDirectory(
								exportDir,
								path.dirname(filename),
							);
							mkdirp(directory);

							let filepath = path.join(
								directory,
								path.basename(filename),
							);

							let buffer = Buffer.from(
								encoding === 'base64'
									? data.split(',')[1]
									: data,
								encoding,
							);

							await writeFile(filepath, buffer);

							log.message(`${green(`export`)} Saved ${filepath}`);
							filepaths.push(filepath);
						}

						res.writeHead(200, {
							'Content-Type': 'application/json',
						});
						res.end(JSON.stringify({ filepaths }));
					} catch (error) {
						log.message(`${red(`export`)} Error`);
						console.error(error);
						res.writeHead(500, {
							'Content-Type': 'application/json',
						});
						res.end(JSON.stringify({ error }));
					}
				} else {
					next();
				}
			});
		},
	};
}
