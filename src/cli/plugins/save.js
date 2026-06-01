import path from 'node:path';
import util from 'node:util';
import { exec as execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { json } from 'milliparsec';
import { log, green, red, yellow } from '../log.js';
import { mkdirp } from '../utils.js';

const exec = util.promisify(execSync);

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

	/**
	 * Check if a directory is within a git repository
	 * @param {string} dir - Directory to check
	 * @returns {Promise<boolean>}
	 */
	async function isGitRepository(directory) {
		try {
			await exec('git status --porcelain');
			return true;
		} catch (error) {
			return false;
		}
	}

	async function commitChanges() {
		const message = `fragment-auto-commit`;

		try {
			log.message(`${yellow(`git`)} Committing latest changes...`);
			await exec(`git add . && git commit -m ${message}`);
			log.message(`${green(`git`)} Committed latest changes.`);
		} catch (error) {
			log.error(error);
		}
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
					payloadLimitErrorFn: (payloadLimit) => {},
				}),
			);
			server.middlewares.use('/save', async (req, res, next) => {
				if (req.method === 'POST') {
					try {
						if (req.body) {
							const { files, commit: shouldCommit = false } =
								req.body;

							let canCommit = false;

							if (shouldCommit) {
								canCommit = await isGitRepository();
							}

							const filepaths = [];
							const warnings = [];

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

								log.message(
									`${green(`export`)} Saved ${filepath}`,
								);
								filepaths.push(filepath);
							}

							if (shouldCommit && canCommit) {
								await commitChanges();
							} else if (shouldCommit) {
								const warning = `Auto-commit failed because the current folder is not a Git repository.`;
								log.warn(warning);
								warnings.push(warning);
							}

							res.writeHead(200, {
								'Content-Type': 'application/json',
							});
							res.end(JSON.stringify({ filepaths, warnings }));
						} else {
							throw new Error(`Payload is too big.`);
						}
					} catch (error) {
						const errorMessage = `Error while trying to save files on disk.`;

						log.message(`${red(`export`)} ${errorMessage}`);
						console.error(error);
						res.writeHead(500, {
							'Content-Type': 'application/json',
						});
						res.end(
							JSON.stringify({
								errors: [errorMessage],
							}),
						);
					}
				} else {
					next();
				}
			});
		},
	};
}
