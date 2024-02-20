import { createServer } from 'vite';
import { bold, cyan, gray, green, inverse, magenta, red } from 'kleur/colors';
import { log } from './log.js';
import { start as startWebSocketServer } from './ws.js';
import { createConfig } from './createConfig.js';
import { getEntries } from './getEntries.js';
import * as p from './prompts.js';
import { createFragmentFile } from './createFragmentFile.js';
import { prettifyTime } from './utils.js';

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

	const startTime = Date.now();
	const s = log.task('run');

	function exit() {
		process.off('SIGTERM', exit);
		process.off('exit', exit);

		if (fragmentServer) {
			fragmentServer.close();
		}

		console.log();
		s.message(red(`Aborted\n`));
	}

	process.once('SIGTERM', exit);
	process.on('exit', exit);

	try {
		const entries = await getEntries(entry, cwd);

		if (entries.length > 0) {
			s.message(
				`Starting ${entries.length > 1 ? `${entries.length} sketches` : magenta(entries[0])}\n`,
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

			log.message(gray(`Starting Vite server...\n`));

			const server = await createServer(config);

			await server.listen();

			s.message(
				green(`Started in ${prettifyTime(Date.now() - startTime)}\n`),
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

			log.message(``);

			return server;
		}
	} catch (error) {
		throw error;
	}
}
