import path from "path";
import { fileURLToPath } from 'url';
import { createServer, defineConfig } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import alias from "@rollup/plugin-alias";

import log from "./log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function start({ options, filepath }) {
    log.warning(`Starting server...`);
    
    const root = path.join(__dirname, '/../..');
    const publicDir = path.join(root, '/public');

    const config = defineConfig({
        configFile: false,
        root,
        publicDir,
        resolve: {
            alias: [
                { find: '@fragment/sketches', replacement: filepath },
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
                path.join(process.cwd(), "sketch.js"),
                path.join(process.cwd(), "sketch2.js"),
            ]
        }
    });

    const server = await createServer(config);

    await server.listen();

    // log.success(`Server started at localhost:${options.port}`);
}
