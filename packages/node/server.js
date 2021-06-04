import path from "path";
import { fileURLToPath } from 'url';

import { createConfiguration, startServer, loadConfiguration } from "snowpack";

const createServer = async ({ dir, port, entry, cwd }) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const clientPath = path.join(__dirname, "../client");
    const appPath = path.join(__dirname, "../app");
    const configPath = path.join(__dirname, "./snowpack.config.mjs");

    const config = await loadConfiguration({
        mode: "development",
        root: dir,
        mount: {
            ".fragment": { url: "/", static: true },
            "": { url: "/", static: true },
            [`${clientPath}`]: { url: "/fragment" },
        },
        devOptions: {
            hostname: "localhost",
            port,
            hmr: true,
        }
    }, configPath);

    const server = await startServer({ config });
};

export { createServer };
