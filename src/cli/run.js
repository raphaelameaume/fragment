import { createServer, mergeConfig } from 'vite';
import { createConfig } from './createConfig.js';
import { createFragmentFile } from './createFragmentFile.js';
import { getEntries } from './getEntries.js';
import { log, magenta, bold, cyan, red } from './log.js';
import screenshot from './plugins/screenshot.js';
import * as p from './prompts.js';
import { prettifyTime } from './utils.js';
import { start as startWebSocketServer } from './ws.js';
import hotSketchReload from './plugins/hot-sketch-reload.js';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';

/**
 * Run a sketch
 * @param {string} entry
 * @param {object} options
 * @param {boolean} options.development
 * @param {number} options.port
 * @param {number} options.exportDir
 */
export async function run(entry, options = {}) {
	let fragmentServer;

	const cwd = process.cwd();
	const command = `run`;
	const prefix = log.prefix(command);
	const exit = () => {
		process.off('SIGTERM', exit);
		process.off('exit', exit);

		if (fragmentServer) {
			fragmentServer.close();
		}

		console.log();
	};

	process.once('SIGTERM', exit);
	process.on('exit', exit);

	const startTime = Date.now();

	try {
		const entries = await getEntries(entry, cwd, command, prefix);

		if (!entries.length) return;

		log.message(
			`Starting ${entries.length > 1 ? `${entries.length} sketches in ${entry}` : magenta(entries[0])}\n`,
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
			},
			cwd,
		);

		log.info(`Starting Vite server...`);

		const server = await createServer(
			mergeConfig(config, {
				server: {
					port: options.port,
					host: true,
					fs: {
						strict: false,
						allow: ['..'],
					},
				},
				define: {
					__FRAGMENT_PORT__: fragmentServer.port,
				},
				plugins: [
					hotSketchReload({
						cwd,
					}),
					hotShaderReplacement({ cwd, wss: fragmentServer }),
					screenshot({ cwd, inlineExportDir: options.exportDir }),
				],
			}),
		);
		await server.listen();

		// line break after logs
		log.message();

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
		log.message();

		return server;
	} catch (error) {
		// line break before error
		log.message();
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
