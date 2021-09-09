import path from "path";
import { fileURLToPath } from 'url';
import { createServer } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import alias from "@rollup/plugin-alias";

import log from "./log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function start({ options }) {
    log.warning(`Starting server...`);
    
    const root = path.resolve(__dirname, "../client");

    const server = await createServer({
        configFile: false,
        root,
        plugins: [
            svelte(),
            alias({
                entries: [
                    { find: '@fragment/scenes', replacement: '../../../../scenes/_fragment/generated.js' }
                ]
            })
        ],
        server: {
            port: options.port
        }
    });

    await server.listen();

    // log.success(`Server started at localhost:${options.port}`);
}
