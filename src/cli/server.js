import path from 'path';
import kleur from 'kleur';
import { fileURLToPath } from 'url';
import { createServer, defineConfig, build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';
import hotSketchReload from './plugins/hot-sketch-reload.js';
import dbPlugin from './plugins/db.js';

import log from './log.js';
import screenshotPlugin from './plugins/screenshot.js';
import checkDependencies from './plugins/check-dependencies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function start({ options, filepaths, entries, fragment }) {
	const root = path.join(__dirname, '/../client');
	const cwd = process.cwd();
	const app = path.join(root, 'app');

	const entriesPaths = entries.map((entry) => path.join(cwd, entry));

	const config = defineConfig({
		configFile: false,
		root,
		logLevel: options.development ? 'info' : 'silent',
		resolve: {
			alias: [
				{ find: '@fragment/sketches', replacement: filepaths[0] },
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
					if (options.development) {
						handler(warning);
					} else {
						return;
					}
				},
			}),
			hotSketchReload({
				cwd,
			}),
			hotShaderReplacement({ cwd, wss: fragment.server }),
			{
				name: 'configure-response-headers',
				configureServer: (server) => {
					server.middlewares.use((_req, res, next) => {
						res.setHeader(
							'Cross-Origin-Opener-Policy',
							'same-origin',
						);
						res.setHeader(
							'Cross-Origin-Embedder-Policy',
							'require-corp',
						);
						next();
					});
				},
			},
			dbPlugin(),
			screenshotPlugin({ cwd, inlineExportDir: options.exportDir }),
			checkDependencies({
				cwd,
				app,
				entriesPaths,
				build: options.build,
			}),
		],
		server: {
			port: options.port,
			host: true,
			fs: {
				strict: false,
				allow: ['..'],
			},
		},
		define: {
			__CWD__: `${JSON.stringify(cwd)}`,
			__FRAGMENT_PORT__: fragment.server
				? fragment.server.port
				: undefined,
			__START_TIME__: Date.now(),
			__SEED__: Date.now(),
			__BUILD__: options.build,
			__DEV__: !options.build,
		},
		optimizeDeps: {
			include: ['convert-length', 'webm-writer', 'changedpi'],
			exclude: ['@fragment/sketches', ...entriesPaths],
		},
		build: {
			commonjsOptions: {
				include: ['convert-length', 'webm-writer', 'changedpi'],
			},
		},
	});

	if (options.build) {
		if (entries.length > 1) {
			log.error(`fragment can only build one sketch at a time.`);
			return;
		}

		const outDir = options.outDir
			? options.outDir
			: entries[0].split('.js')[0];

		await build({
			...config,
			logLevel: 'info',
			base: options.base,
			build: {
				outDir: path.join(process.cwd(), outDir),
				emptyOutDir: options.emptyOutDir,
			},
		});

		log.success(`Built files for:`);
		entries.forEach((entry) => console.log(`- ${entry}`));
	} else {
		log.warning(`Starting server...`);
		const server = await createServer(config);

		server.middlewares.use('/db', (req, res, next) => {
			next();
		});

		await server.listen();

		log.success(`Server started at:`);

		const { resolvedUrls } = server;

		for (const url of resolvedUrls.local) {
			console.log(
				`  ${kleur.green('➜')}  ${kleur.bold('Local')}:   ${kleur.cyan(
					url,
				)}`,
			);
		}
		for (const url of resolvedUrls.network) {
			console.log(
				`  ${kleur.green('➜')}  ${kleur.bold('Network')}: ${kleur.cyan(
					url,
				)}`,
			);
		}

		return server;
	}
}
