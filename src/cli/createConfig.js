import path from 'node:path';
import fs from 'node:fs';
import { defineConfig, loadConfigFromFile, mergeConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

import checkDependencies from './plugins/check-dependencies.js';
import { file } from './utils.js';
import { log } from './log.js';

export async function loadConfig({ cwd, filepath }) {
	try {
		let filename = `fragment.config.js`;
		let configFile = filepath ? filepath : filename;
		let configRoot = cwd;
		let resolvedPath = path.resolve(cwd, configFile);

		if (!fs.existsSync(resolvedPath)) {
			if (filepath) {
				log.error(`Config file not found: ${resolvedPath}`);
			}
			return {};
		}

		log.info(`Extending configuration from ${resolvedPath}`);

		const { config } = await loadConfigFromFile(
			{
				command: 'build',
				mode: 'dev',
			},
			configFile,
			configRoot,
		);

		return config;
	} catch (error) {
		log.error(error);
		return {};
	}
}

/**
 * Create Vite config from entries
 * @param {string[]} entries
 * @param {string} fragmentFilepath
 * @param {options} options
 * @param {boolean} [options.dev=false]
 * @param {boolean} [options.build=false]
 * @param {string} [cwd=process.cwd()]
 * @returns {import('vite').UserConfig}
 */
export async function createConfig(
	entries,
	fragmentFilepath,
	{ dev = false, build = false } = {},
	configFilepath,
	cwd = process.cwd(),
) {
	const entriesPaths = entries.map((entry) => path.join(cwd, entry));
	const root = file('../client');
	const app = path.join(root, 'app');

	log.info(`Creating Vite configuration...`);

	const config = await loadConfig({
		filepath: configFilepath,
		cwd,
	});

	return mergeConfig(
		defineConfig({
			configFile: false,
			root,
			logLevel: dev ? 'info' : 'silent',
			resolve: {
				alias: [
					{
						find: '@fragment/sketches',
						replacement: fragmentFilepath,
					},
					{ find: '@fragment', replacement: app },
					{
						find: 'three',
						replacement: path.join(cwd, 'node_modules/three'),
					},
					{
						find: 'p5',
						replacement: path.join(cwd, 'node_modules/p5'),
					},
					{
						find: 'ogl',
						replacement: path.join(cwd, 'node_modules/ogl'),
					},
				],
			},
			plugins: [
				svelte({
					configFile: false,
					onwarn: (warning, handler) => {
						if (dev) {
							handler(warning);
						} else {
							return;
						}
					},
				}),
				checkDependencies({
					cwd,
					app,
					entriesPaths,
					build,
				}),
			],
			define: {
				__CWD__: `${JSON.stringify(cwd)}`,
				__FRAGMENT_PORT__: undefined,
				__START_TIME__: Date.now(),
				__SEED__: Date.now(),
				__BUILD__: build,
				__DEV__: !build,
			},
			optimizeDeps: {
				include: ['convert-length', 'webm-writer', 'changedpi'],
				exclude: ['@fragment/sketches', ...entriesPaths],
			},
		}),
		config.vite ?? {},
	);
}
