import path from "path";
import fs from "fs";
import bodyParser from "body-parser";

export default function screenshot({ cwd }) {
	return {
		name: 'screenshot',
		configureServer(server){
			server.middlewares.use(bodyParser.json({ limit: '50mb'}))
			server.middlewares.use('/screenshot', (req, res, next) => {
				if (req.method === "POST") {
					const { filename, dataURL } = req.body;

					const filepath = path.join(cwd, filename);
					const buffer = Buffer.from(dataURL.replace(/^data:image\/\w+;base64,/, ''), 'base64');

					fs.writeFile(filepath, buffer, (error) => {
						let statusCode = error ? 500 : 200;
						let body = error ? { error } : { filepath };

						res.writeHead(statusCode, {'Content-Type': 'application/json'});
						res.end(JSON.stringify(body));
					});
				} else {
					next();
				}
			})
			
		}
	}

}
