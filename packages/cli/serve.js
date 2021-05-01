const fs = require("fs/promises");
const log = require("./log");
const polka = require("polka");
const sirv = require("sirv");
const path = require("path")
const getPort = require("get-port");

const serve = async (dir, port) => {
    try {
        const stats = await fs.lstat(dir);

        if (!stats.isDirectory()) throw new Error();

        const availablePort = await getPort({ port: getPort.makeRange(port, port + 1000) });

        if (port !== availablePort) {
            log.warning(`Port ${port} not available. Using ${availablePort} instead.`);
        }

        const templateHtmlFile = path.resolve(__dirname, 'templates/index.html');

        polka()
            .use(sirv(dir, { dev: true }))
            .use(async (req, res, next) => {
                if (req.url === "/") {
                    const html = await fs.readFile(templateHtmlFile);
                    res.end(html);
                }

                next();
            })
            .listen(availablePort, (err) => {
                if (err) throw err;
                log.success(`Listening on http://localhost:${availablePort}`);
            });
    } catch(err) {
        console.error(err);
        log.error(`${dir} doesn't exist.`);
    }
};

module.exports = serve;
