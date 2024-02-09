import path from 'path';
import kleur from 'kleur';
import log from '../log.js';

export default function hotSketchReload({ cwd }) {
	const shaderRegex = /\.(?:frag|vert|glsl|vs|fs)$/;
	return {
		name: 'hot-sketch-reload',
		handleHotUpdate: async ({ server, modules, file, read }) => {
			if (file.includes(cwd) && !shaderRegex.test(file)) {
				const filepath = path.relative(cwd, file);
				console.log(
					`${log.prefix} ${kleur.green(`hmr update`)} /${filepath}`,
				);

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
