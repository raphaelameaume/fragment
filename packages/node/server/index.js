import path from "path";
import { fileURLToPath } from 'url';

import { createConfiguration, startServer } from "snowpack";

const createServer = async ({ dir, port, entry, cwd }) => {
    const buildDir = path.join(dir, '.fragment/');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const clientPath = path.join(__dirname, "../../client");

    const config = createConfiguration({
        mode: "development",
        root: dir,
        mount: {
            [`${clientPath}`]: { url: "/fragment" },
            ".fragment": { url: "/" },
            "": { url: "/" },
        },
        devOptions: {
            hostname: "localhost",
            port,
            hmr: true,
        },
        plugins: [
            ["@snowpack/plugin-svelte"]
        ]
    });

    const server = await startServer({ config });
};

export { createServer };