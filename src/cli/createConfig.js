import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

import checkDependencies from './plugins/check-dependencies.js';
import { __dirname, file } from './utils.js';
import { log } from './log.js';
import sketches from './plugins/sketches.js';

/**
 *
 * @param {{ cwd: string, filepath: string | undefined }} params
 * @returns {Promise<import('../types/config.js').Config>}
 */
export async function loadConfig({ cwd, filepath }) {
	try {
		let configRoot = cwd;
		let filenames = [`fragment.config.js`, `fragment.config.ts`];

		if (filepath) {
			filenames = [filepath, ...filenames];
		}

		let filepaths = filenames.map((filename) => {
			return path.resolve(configRoot, filename);
		});

		let resolvedIndex = filepaths.findIndex((filepath) =>
			fs.existsSync(filepath),
		);
		/** @type {string|undefined} */
		let resolvedPath = filepaths[resolvedIndex];

		if (filepath && resolvedIndex !== 0) {
			log.error(`Config file not found: ${filepath}`);
		}

		if (!resolvedPath) {
			return {};
		}

		let configFile = path.relative(cwd, resolvedPath);

		log.info(`Extending configuration from ${configFile}`);

		const config = (
			await import(
				`${url.pathToFileURL(configFile).href}?ts=${Date.now()}`
			)
		).default;

		return config;
	} catch (error) {
		log.error(error);
		return {};
	}
}

/**
 * Create Vite config from entries
 * @param {string[]} entries
 * @param {object} [options]
 * @param {boolean} [options.dev=false]
 * @param {boolean} [options.build=false]
 * @param {string} [configFilepath]
 * @param {string} [cwd=process.cwd()]
 * @returns {Promise<import('vite').UserConfig>}
 */
export async function createConfig(
	entries,
	{ dev = false, build = false } = {},
	configFilepath,
	cwd = process.cwd(),
) {
	const entriesPaths = entries.map((entry) => path.join(cwd, entry));
	const root = file('../client');
	const publicDir = path.join(cwd, 'public');
	const app = path.join(root, 'app');

	log.info(`Creating Vite configuration...`);

	const config = await loadConfig({
		cwd,
		filepath: configFilepath,
	});

	return mergeConfig(
		defineConfig({
			configFile: false,
			root,
			logLevel: dev ? 'info' : 'silent',
			publicDir,
			resolve: {
				alias: {
					'@fragment/types': path.join(__dirname, 'src/types'),
					'@fragment': path.join(__dirname, 'src/client/app'),
					three: path.join(cwd, 'node_modules/three'),
					p5: path.join(cwd, 'node_modules/p5'),
					ogl: path.join(cwd, 'node_modules/ogl'),
				},
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
				sketches({ cwd, entries }),
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
				include: ['convert-length', 'changedpi'],
			},
		}),
		config.vite ?? {},
	);
}
