import path from "path";
import { fileURLToPath } from 'url';
import { createServer, defineConfig } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte'

import log from "./log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function start({ options, filepaths, entries }) {
    log.warning(`Starting server...`);

    // const root = path.join(__dirname, '/../..');
    const root = path.join(__dirname, '/../client');
    const cwd = process.cwd();
    // const publicDir = path.join(root, '/public');

    const config = defineConfig({
        configFile: false,
        root,
        resolve: {
            alias: [
                { find: '@fragment/sketches', replacement: filepaths[0] },
                { find: '@fragment/props', replacement: filepaths[1] },
                { find: '@fragment', replacement: path.join(root, 'app') },
            ]
        },
        fs: {
            allow: [".."]
        },
        plugins: [
            svelte(),
            {
                name: 'configure-response-headers',
                configureServer: (server) => {
                    server.middlewares.use((_req, res, next) => {
                        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                        next();
                    });
                }
            }
        ],
        server: {
            port: options.port,
            host: true
        },
        define: {
            '__CWD__': `'${cwd}'`
        },
        optimizeDeps: {
            exclude: [
                ...filepaths,
                ...entries.map((entry ) => path.join(process.cwd(), entry)),
            ]
        }
    });

    const server = await createServer(config);

    await server.listen();

    // log.success(`Server started at localhost:${options.port}`);
}
