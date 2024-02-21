import { createServer } from 'vite';
import { createConfig } from './createConfig.js';
import { createFragmentFile } from './createFragmentFile.js';
import { getEntries } from './getEntries.js';
import { log, magenta, bold, cyan, red } from './log.js';
import * as p from './prompts.js';
import { prettifyTime } from './utils.js';
import { start as startWebSocketServer } from './ws.js';

/**
 * Run a sketch
 * @param {string} entry
 * @param {object} options
 * @param {boolean} options.development
 * @param {number} options.port
 * @param {number} options.exportDir
 */
export async function run(entry, options = {}) {
	const cwd = process.cwd();
	const prefix = log.prefix('run');

	if (entry === undefined) {
		log.error(`Missing argument.`);
		return;
	}

	let fragmentServer;

	const startTime = Date.now();

	function exit() {
		process.off('SIGTERM', exit);
		process.off('exit', exit);

		if (fragmentServer) {
			fragmentServer.close();
		}

		console.log();
		log.error(`Aborted\n`, prefix);
	}

	process.once('SIGTERM', exit);
	process.on('exit', exit);

	try {
		const entries = await getEntries(entry, cwd);

		if (entries.length > 0) {
			log.message(
				`Starting ${entries.length > 1 ? `${entries.length} sketches` : magenta(entries[0])}\n`,
				prefix,
			);

			if (entries.length > 1) {
				log.message(
					`${entries.map((entry) => `- ${magenta(entry)}`).join('\n')}\n`,
				);
			}

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

			log.info(`Starting Vite server...\n`);

			const server = await createServer(config);

			await server.listen();

			log.success(
				`Started in ${prettifyTime(Date.now() - startTime)}\n`,
				prefix,
			);

			const { resolvedUrls } = server;

			let urls = ``;

			for (const url of resolvedUrls.local) {
				urls += `${bold('Local')}:   ${bold(cyan(url))}\n`;
			}

			for (const url of resolvedUrls.network) {
				urls += `${bold('Network')}: ${bold(cyan(url))}`;
			}

			p.note(urls);

			// line break before fragment logs
			log.message(``);

			return server;
		}
	} catch (error) {
		throw error;
	}
}
