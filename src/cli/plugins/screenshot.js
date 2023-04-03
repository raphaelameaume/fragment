import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import bodyParser from 'body-parser';
import log from '../log.js';

export default function screenshot({ cwd, inlineExportDir }) {
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

					if (!fsSync.existsSync(directory)) {
						try {
							await fs.mkdir(directory, { recursive: true });
						} catch (error) {
							log.error('Cannot create directory for exports');
							console.log(error);
						}
					}

					try {
						await fs.writeFile(filepath, buffer);

						log.success(`Saved ${filepath}`);

						res.writeHead(200, {
							'Content-Type': 'application/json',
						});
						res.end(JSON.stringify({ filepath }));
					} catch (error) {
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
