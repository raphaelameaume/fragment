import path from 'node:path';
import fs from 'node:fs';
import { createServer, mergeConfig } from 'vite';
import { loadConfig, createConfig } from './createConfig.js';
import {
	createTsConfigFile,
	FRAGMENT_DIRECTORY,
} from './createFragmentFile.js';
import { getEntries } from './getEntries.js';
import { log, magenta, bold, cyan, red } from './log.js';
import save from './plugins/save.js';
import * as p from './prompts.js';
import { prettifyTime } from './utils.js';
import { start as startWebSocketServer } from './ws.js';
import hotSketchReload from './plugins/hot-sketch-reload.js';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';

/**
 * Run a sketch
 * @param {string} entry
 * @param {object} [options={}]
 * @param {number} options.exportDir
 * @param {boolean} options.development
 * @param {number} options.port
 * @param {boolean} options.open
 * @param {string} options.configFilepath
 * @returns {Promise<void>}
 */
export async function run(entry, { exportDir, development, port, open, configFilepath } = {}) {
	let fragmentServer;
	/** @type {import('node:fs').FSWatcher} */
	let watcher;

	const cwd = process.cwd();
	const command = `run`;
	const prefix = log.prefix(command);

	const options = { exportDir, development, port, open, configFilepath };

	const stop = () => {
		fragmentServer?.close();
		watcher?.close();
	};

	const exit = () => {
		process.off('SIGTERM', exit);
		process.off('exit', exit);

		stop();

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

		const fragmentConfig = await loadConfig({
			cwd,
			filepath: configFilepath,
		});

		port = port ?? fragmentConfig.port;
		open = open ?? fragmentConfig.open;

		const hasTSFiles = entries.some((entry) => entry.endsWith('ts'));
		const tsConfigDirpath = path.join(cwd, FRAGMENT_DIRECTORY);
		const tsConfigFilepath = path.join(tsConfigDirpath, 'tsconfig.json');
		if (!fs.existsSync(tsConfigFilepath) && hasTSFiles) {
			await createTsConfigFile(cwd);
		}

		fragmentServer = await startWebSocketServer({
			cwd,
		});

		const config = await createConfig(
			entries,
			{
				dev: development,
				build: false,
			},
			fragmentConfig.vite,
			cwd,
		);

		log.info(`Starting Vite server...`);

		const server = await createServer(
			mergeConfig(config, {
				server: {
					host: true,
					port,
					open,
					fs: {
						strict: false,
						allow: ['..'],
					},
				},
				define: {
					__FRAGMENT_PORT__: fragmentServer.port,
				},
				plugins: [
					hotSketchReload({ cwd, }),
					hotShaderReplacement({ cwd, wss: fragmentServer }),
					save({ cwd, inlineExportDir: exportDir, configExportDir: fragmentConfig.exportDir }),
				],
			}),
		);

		watcher = fs.watch(cwd, (eventType, filename) => {
			if (
				['fragment.config.js', 'fragment.config.ts'].includes(
					filename,
				) ||
				configFilepath?.includes(filename)
			) {
				log.warn(`${filename} has changed. Restarting...`);
				console.log();
				server.close();
				stop();
				run(entry, options);
			}
		});

		await server.listen();

		// line break after logs
		log.message();

		log.success(
			`Started in ${prettifyTime(Date.now() - startTime)}\n`,
			prefix,
		);

		const { resolvedUrls } = server;

		let urls = [
			...resolvedUrls.local.map(
				(url) => `${bold('Local')}:   ${bold(cyan(url))}`,
			),
			...resolvedUrls.network.map(
				(url) => `${bold('Network')}: ${bold(cyan(url))}`,
			),
		];
		p.note(urls.join(`\n`));

		// line break before fragment logs
		log.message();
	} catch (error) {
		// line break before error
		log.message();
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
