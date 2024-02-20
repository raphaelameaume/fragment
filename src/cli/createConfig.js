import { defineConfig } from 'vite';
import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';
import hotSketchReload from './plugins/hot-sketch-reload.js';
import screenshot from './plugins/screenshot.js';
import checkDependencies from './plugins/check-dependencies.js';
import { file } from './utils.js';
import { log } from './log.js';
import { gray } from 'kleur/colors';

/**
 * Create Vite config from
 * @param {string[]} entries
 * @param {string[]} fragmentFilepath
 * @param {options} options
 * @returns {import('vite').UserConfig}
 */
export function createConfig(
	entries,
	fragmentFilepath,
	{ dev = false, exportDir, build = false, port } = {},
	fragmentServer,
	cwd = process.cwd(),
) {
	const entriesPaths = entries.map((entry) => path.join(cwd, entry));
	const root = file('../client');
	const app = path.join(root, 'app');

	log.message(gray(`Creating Vite configuration...`));

	return defineConfig({
		configFile: false,
		root,
		logLevel: dev ? 'info' : 'silent',
		resolve: {
			alias: [
				{ find: '@fragment/sketches', replacement: fragmentFilepath },
				{ find: '@fragment', replacement: app },
				{
					find: 'three',
					replacement: path.join(cwd, 'node_modules/three'),
				},
				{ find: 'p5', replacement: path.join(cwd, 'node_modules/p5') },
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
			hotSketchReload({
				cwd,
			}),
			hotShaderReplacement({ cwd, wss: fragmentServer }),
			screenshot({ cwd, inlineExportDir: exportDir }),
			checkDependencies({
				cwd,
				app,
				entriesPaths,
				build,
			}),
		],
		server: {
			port,
			host: true,
			fs: {
				strict: false,
				allow: ['..'],
			},
		},
		define: {
			__CWD__: `${JSON.stringify(cwd)}`,
			__FRAGMENT_PORT__: fragmentServer?.port,
			__START_TIME__: Date.now(),
			__SEED__: Date.now(),
			__BUILD__: build,
			__DEV__: !build,
		},
		optimizeDeps: {
			include: ['convert-length', 'webm-writer', 'changedpi'],
			exclude: ['@fragment/sketches', ...entriesPaths],
		},
	});
}
