import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import bodyParser from 'body-parser';
import { log } from '../log.js';
import { mkdirp } from '../utils.js';
import { green, inverse } from 'kleur/colors';

/**
 *
 * @param {object} params
 * @param {string} cwd - Current working directory
 * @param {string} inlineExportDir - Directory path used for exports
 * @returns {import('vite').Plugin}
 */
export default function screenshot({ cwd = process.cwd(), inlineExportDir }) {
	function resolveDirectory(directoryPath) {
		return path.isAbsolute(directoryPath)
			? directoryPath
			: path.join(cwd, directoryPath);
	}

	function resolveExportDirectory({ exportDir }) {
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
		name: 'screenshot',
		configureServer(server) {
			server.middlewares.use(bodyParser.json({ limit: '100mb' }));
			server.middlewares.use('/save', async (req, res, next) => {
				if (req.method === 'POST') {
					const { filename, dataURL } = req.body;

					let directory = resolveExportDirectory(req.body);

					const filepath = path.join(directory, filename);
					const buffer = Buffer.from(dataURL, 'base64');

					mkdirp(directory);

					try {
						await writeFile(filepath, buffer);

						log.message(`${green(`export`)} Saved ${filepath}`);

						res.writeHead(200, {
							'Content-Type': 'application/json',
						});
						res.end(JSON.stringify({ filepath }));
					} catch (error) {
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
