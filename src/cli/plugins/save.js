import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import bodyParser from 'body-parser';
import { log, green, red } from '../log.js';
import { mkdirp } from '../utils.js';

/**
 *
 * @param {object} [params]
 * @param {string} [cwd=process.cwd()] - Current working directory
 * @param {string} [inlineExportDir] - Directory path used for exports
 * @returns {import('vite').Plugin}
 */
export default function screenshot({
	cwd = process.cwd(),
	inlineExportDir,
} = {}) {
	function resolveDirectory(directoryPath) {
		return path.isAbsolute(directoryPath)
			? directoryPath
			: path.join(cwd, directoryPath);
	}

	function resolveExportDirectory(exportDir) {
		let directory;

		if (inlineExportDir) {
			if (!inlineExportDirPath) {
				inlineExportDirPath = resolveDirectory(inlineExportDir);
			}

			directory = inlineExportDirPath;

			if (exportDir) {
				log.warning(
					`'exportDir' configuration from sketch has been overridden by --exportDir.`,
				);
			}
		} else if (exportDir) {
			directory = resolveDirectory(exportDir);
		} else {
			directory = cwd;
		}

		return directory;
	}

	let inlineExportDirPath;

	return {
		name: 'save',
		configureServer(server) {
			server.middlewares.use(bodyParser.json({ limit: '100mb' }));
			server.middlewares.use('/save', async (req, res, next) => {
				if (req.method === 'POST') {
					const { files } = req.body;

					try {
						const filepaths = [];

						for (let i = 0; i < files.length; i++) {
							const { filename, data, encoding, exportDir } =
								files[i];

							let directory = resolveExportDirectory(exportDir);
							mkdirp(directory);

							let filepath = path.join(directory, filename);

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
