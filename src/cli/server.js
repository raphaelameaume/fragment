import path from "path";
import os from 'os';
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import { createServer, defineConfig, build } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import hotShaderReload from "./plugins/hot-shader-reload.js";
import hotSketchReload from "./plugins/hot-sketch-reload.js";
import dbPlugin from "./plugins/db.js";

import log from "./log.js";
import db from "./db.js";
import screenshotPlugin from "./plugins/screenshot.js";
import checkDependencies from "./plugins/check-dependencies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function start({ options, filepaths, entries, fragment }) {
    const root = path.join(__dirname, '/../client');
    const cwd = process.cwd();
    const app = path.join(root, 'app');

    const entriesPaths = entries.map((entry ) => path.join(cwd, entry));

    const config = defineConfig({
        configFile: false,
        root,
        logLevel: options.development ? "info" : "silent",
        resolve: {
            alias: [
                { find: '@fragment/sketches', replacement: filepaths[0] },
                { find: '@fragment', replacement: app },
                { find: 'three', replacement: path.join(cwd, 'node_modules/three') },
                { find: 'p5', replacement: path.join(cwd, 'node_modules/p5') },
                { find: 'ogl', replacement: path.join(cwd, 'node_modules/ogl') },
            ]
        },
        fs: {
            allow: [".."]
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
                }
            }),
            hotSketchReload({
                cwd,
            }),
            hotShaderReload({ wss: fragment.server }),
            {
                name: 'configure-response-headers',
                configureServer: (server) => {
                    server.middlewares.use((_req, res, next) => {
                        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                        next();
                    });
                }
            },
            dbPlugin(),
            screenshotPlugin({ cwd }),
            checkDependencies({
                cwd,
                app,
                entriesPaths,
                build: options.build,
            })
        ],
        server: {
            port: options.port,
            host: true,
            // middlewareMode: "ssr",
        },
        define: {
            '__CWD__': `${JSON.stringify(cwd)}`,
            '__FRAGMENT_PORT__': fragment.server ? fragment.server.port : undefined,
            '__START_TIME__': Date.now(),
            '__SEED__': Date.now(),
            '__PRODUCTION__': options.build,
        },
        optimizeDeps: {
            exclude: [
                ...filepaths,
                ...entriesPaths,
            ]
        }
    });

    if (options.build) {
        if (entries.length > 1) {
            log.error(`fragment can only build one sketch at a time.`);
            return;
        }

        const outDir = options.outDir ? options.outDir : entries[0].split('.js')[0];

        await build({
            ...config,
            logLevel: "info",
            build: {
                outDir: path.join(process.cwd(), outDir),
                emptyOutDir: options.emptyOutDir,
            },
        });

        log.success(`Built files for:`);
        entries.forEach(entry => console.log(`- ${entry}`));
    } else {
        log.warning(`Starting server...`);
        const server = await createServer(config);

        server.middlewares.use('/db', (req, res, next) => {
            next();
        });

        await server.listen();
        log.success(`Server started at:`);

        Object.values(os.networkInterfaces())
            .flatMap((nInterface) => nInterface ?? [])
            .filter((detail) => detail && detail.address && (detail.family === 'IPv4' || detail.family === 4 ))
            .forEach((detail) => {
                const type = detail.address.includes('127.0.0.1')
                ? 'Local:   '
                : 'Network: '
                const host = detail.address.replace('127.0.0.1', 'localhost');
                const url = `http://${host}:${server.config.server.port}`;
                console.log(`   ${type} ${url}`);
            })

        return server;
    }
}
