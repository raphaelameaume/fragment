import path from "path";
import os from 'os';
import { fileURLToPath } from 'url';
import { createServer, defineConfig } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import hotShaderReload from "./plugins/hot-shader-reload.js";
import hotSketchReload from "./plugins/hot-sketch-reload.js";
import dbPlugin from "./plugins/db.js";

import log from "./log.js";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function start({ options, filepaths, entries, fragment }) {
    log.warning(`Starting server...`);

    const root = path.join(__dirname, '/../client');
    const cwd = process.cwd();
    const app = path.join(root, 'app');

    const config = defineConfig({
        configFile: false,
        root,
        logLevel: "silent",
        resolve: {
            alias: [
                { find: '@fragment/sketches', replacement: filepaths[0] },
                { find: '@fragment/props', replacement: filepaths[1] },
                { find: '@fragment', replacement: app },
                { find: 'three', replacement: path.join(process.cwd(), 'node_modules/three') },
            ]
        },
        fs: {
            allow: [".."]
        },
        plugins: [
            svelte({
                configFile: false,
                onwarn: (warning, handler) => {
                    // return;
                    handler(warning);
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
        ],
        server: {
            port: options.port,
            host: true,
            // middlewareMode: "ssr",
        },
        define: {
            '__CWD__': `'${cwd}'`,
            '__FRAGMENT_PORT__': fragment.server.port,
            '__START_TIME__': Date.now(),
            '__SEED__': Date.now()
        },
        optimizeDeps: {
            exclude: [
                ...filepaths,
                ...entries.map((entry ) => path.join(process.cwd(), entry)),
            ]
        }
    });

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
