import path from "path";
import { fileURLToPath } from 'url';
import { createServer, defineConfig } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte'

import log from "./log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function start({ options, filepath, entries }) {
    log.warning(`Starting server...`);

    // const root = path.join(__dirname, '/../..');
    const root = path.join(__dirname, '/../client');
    // const publicDir = path.join(root, '/public');

    const config = defineConfig({
        configFile: false,
        root,
        resolve: {
            alias: [
                { find: '@fragment/sketches', replacement: filepath },
                { find: '@fragment', replacement: path.join(root, 'app') },
            ]
        },
        fs: {
            allow: [".."]
        },
        plugins: [
            svelte(),
        ],
        server: {
            port: options.port,
        },
        optimizeDeps: {
            exclude: [
                filepath,
                ...entries.map((entry ) => path.join(process.cwd(), entry)),
            ]
        }
    });

    const server = await createServer(config);

    await server.listen();

    // log.success(`Server started at localhost:${options.port}`);
}
