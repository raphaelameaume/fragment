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
 * @param {string} [inlineExportDir] - Directory path used for exports
 * @returns {import('vite').Plugin}
 */
export default function screenshot({
	cwd = process.cwd(),
	inlineExportDir,
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
				inlineExportDirPath = resolveDirectory(inlineExportDir);
			}

			directory = inlineExportDirPath;

			if (exportDir) {
				log.warning(
					`'exportDir' configuration from sketch has been overridden by --exportDir.`,
				);
			}
		} else if (exportDir) {
			directory = resolveDirectory(exportDir, dirname);
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
			log.error(`Not a git repository`);
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
					const { files, commit } = req.body;

					try {
						let shouldCommit = false;

						if (commit) {
							shouldCommit = await isGitRepository();
						}

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

						if (shouldCommit) {
							await commitChanges();
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
