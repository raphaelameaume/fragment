import db from "../db.js"

export default function dbPlugin() {
	return {
		name: 'db',
		configureServer(server) {
			server.middlewares.use('/db', (req, res, next) => {
				res.end(JSON.stringify(db.read()))
			})
		}
	};
}
