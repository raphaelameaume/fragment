import path from 'node:path';
import { log, green } from '../log.js';

/**
 * Send a custom event to Fragment when a sketch changes
 * @param {object} params
 * @param {string} params.cwd - Current working directory
 * @returns {import('vite').Plugin}
 */
export default function hotSketchReload({ cwd = process.cwd() } = {}) {
	const shaderRegex = /\.(?:frag|vert|glsl|vs|fs)$/;
	return {
		name: 'hot-sketch-reload',
		handleHotUpdate: async ({ server, modules, file }) => {
			if (file.includes(cwd) && !shaderRegex.test(file)) {
				const filepath = path.relative(cwd, file);

				log.message(`${green(`hmr update`)} /${filepath}`);

				server.ws.send({
					type: 'custom',
					event: 'sketch-update',
					data: {
						file,
						filepath,
						cwd,
					},
				});
			}

			return modules;
		},
	};
}
