import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import bodyParser from "body-parser";
import log from "../log.js";

export default function screenshot({ cwd, exportDir = cwd }) {
	let dir = (path.isAbsolute(exportDir) ? exportDir : path.join(cwd, exportDir));

	return {
		name: 'screenshot',
		configureServer(server){
			server.middlewares.use(bodyParser.json({ limit: '100mb'}))
			server.middlewares.use('/save', async (req, res, next) => {
				if (req.method === "POST") {
					const { filename, dataURL } = req.body;

					const filepath = path.join(dir, filename);
					const buffer = Buffer.from(dataURL, 'base64');

					if (!fsSync.existsSync(dir)) {
						try {
							await fs.mkdir(dir, { recursive: true });
						} catch(error) {
							log.error('Cannot create directory for exports');
							console.log(error);
						}
					}

					try {
						await fs.writeFile(filepath, buffer);

						res.writeHead(200, {'Content-Type': 'application/json'});
						res.end(JSON.stringify({ filepath }));
					} catch(error) {
						res.writeHead(500, {'Content-Type': 'application/json'});
						res.end(JSON.stringify({ error }));
					}
				} else {
					next();
				}
			});
		}
	}

}
