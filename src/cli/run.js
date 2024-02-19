import { createServer } from 'vite';
import { log } from './log.js';
import { start as startWebSocketServer } from './ws.js';
// import templates from './templates/index.js';
import { createConfig } from './createConfig.js';
import { getEntries } from './getEntries.js';
import { createFragmentFile } from './createFragmentFile.js';
import { bold, cyan, green } from 'kleur/colors';

/**
 * Run a sketch
 * @param {string} entry
 * @param {object} options
 * @param {boolean} options.development
 * @param {number} options.port
 * @param {number} options.exportDir
 */
export async function run(entry, options = {}) {
	if (entry === undefined) {
		log.error(`Missing argument.`);
		return;
	}

	let fragmentServer;
	const cwd = process.cwd();

	function exit() {
		process.off('SIGTERM', exit);

		if (fragmentServer) {
			fragmentServer.close();
		}
	}

	process.once('SIGTERM', exit);

	try {
		const entries = await getEntries(entry, cwd);

		if (entries.length > 0) {
			const fragmentFilepath = await createFragmentFile(entries, cwd);

			fragmentServer = await startWebSocketServer({
				cwd,
			});

			const config = createConfig(
				entries,
				fragmentFilepath,
				{
					dev: options.development,
					build: false,
					exportDir: options.exportDir,
					port: options.port,
				},
				fragmentServer,
				cwd,
			);

			log.warning(`Starting server...`);
			const server = await createServer(config);
			await server.listen();

			log.success(`Server started at:`);

			const { resolvedUrls } = server;

			for (const url of resolvedUrls.local) {
				console.log(
					`  ${green('➜')}  ${bold('Local')}:   ${cyan(url)}`,
				);
			}
			for (const url of resolvedUrls.network) {
				console.log(
					`  ${green('➜')}  ${bold('Network')}: ${cyan(url)}`,
				);
			}

			return server;
		}
	} catch (error) {
		console.log(error);
	}
}
