import fs from "fs/promises";
import polka from "polka";
import getPort from "get-port";

import html from "./middlewares/html.js";
import bundler from "./middlewares/bundler.js";
import staticMiddleware from "./middlewares/static.js";
import log from "../log.js";
import { createWebSocketServer } from "./ws.js";
import path from "path";

import { createConfiguration, startServer } from "snowpack";
// const createServer = async ({ dir, port, entry, cwd }) => {
//     try {
//         const stats = await fs.lstat(dir);

//         if (!stats.isDirectory()) throw new Error();

//         const availablePort = await getPort({ port: getPort.makeRange(port, port + 1000) });

//         if (port !== availablePort) {
//             log.warning(`Port ${port} not available. Using ${availablePort} instead.`);
//         }

//         const wss = await createWebSocketServer();

//         return polka()
//             .use(bundler({ entry, cwd, wss }))
//             .use(html({ wss }))
//             .use(staticMiddleware(dir))
//             .listen(availablePort, (err) => {
//                 if (err) throw err;
//                 log.success(`Listening on http://localhost:${availablePort}`);
//             });
//     } catch(err) {
//         console.error(err);
//         log.error(`${dir} doesn't exist.`);
//     }
// };

const createServer = async ({ dir, port, entry, cwd }) => {
    const buildDir = path.join(dir, '.fragment/');
    console.log(buildDir);

    const config = createConfiguration({
        mode: "development",
        root: dir,
        mount: {
            ".fragment": { url: "/" },
            "": { url: "/" },
        },
        devOptions: {
            hostname: "localhost",
            port,
            hmr: true,
        }
    });

    const server = await startServer({ config });
};

export { createServer };
