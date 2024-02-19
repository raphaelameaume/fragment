import fs from 'node:fs';
import path from 'node:path';
import { log } from '../log.js';

export default function checkDependencies({
	cwd,
	app,
	entriesPaths,
	build,
} = {}) {
	const regex =
		/\bexport[\s]*\b(let|const)[\s]*\brendering\b[\s]*=[\s]*["'](.*?)["']/;

	const dependenciesMap = new Map();
	dependenciesMap.set('three', ['three']);
	dependenciesMap.set('p5', ['p5']);
	dependenciesMap.set('fragment', []);
	dependenciesMap.set('2d', []);

	const renderers = new Map();
	renderers.set('three', `${app}/renderers/THREERenderer.js`);
	renderers.set('p5', `${app}/renderers/P5Renderer.js`);
	renderers.set('ogl', `${app}/renderers/OGLRenderer.js`);
	renderers.set('fragment', `${app}/renderers/FragmentRenderer.js`);
	renderers.set('2d', `${app}/renderers/2DRenderer.js`);

	const renderings = [];

	entriesPaths.forEach((entry) => {
		const content = fs.readFileSync(entry, { encoding: 'utf-8' });
		const match = content.match(regex);
		const rendering = match && match[2];

		if (rendering && dependenciesMap.has(rendering)) {
			renderings.push(rendering);

			const dependencies = dependenciesMap.get(rendering);
			dependencies.forEach((dependency) => {
				const dependencyPath = path.join(
					cwd,
					`node_modules/${dependency}`,
				);
				const isInstalled = fs.existsSync(dependencyPath);

				if (!isInstalled) {
					const filename = entry.split(`${cwd}/`)[1];
					const error = `Missing dependency "${dependency}" in ${filename}`;
					log.error(error);
					console.log(`
It looks like you're trying to build a ${dependency} sketch (${filename}) without having ${dependency} installed.
Run 'npm install ${dependency}' before starting Fragment to run ${filename}.
					`);

					throw new Error(error);
				}
			});
		}
	});

	const skipFiles = [...renderers.keys()]
		.map((key) => {
			if (!renderings.includes(key)) {
				return renderers.get(key);
			} else {
				return [];
			}
		})
		.flat();

	return {
		name: 'check-dependencies',
		config: () => ({
			define: {
				__THREE_RENDERER__: build
					? renderings.some((rendering) => rendering === 'three')
					: true,
				__P5_RENDERER__: build
					? renderings.some((rendering) => rendering === 'p5')
					: true,
				__FRAGMENT_RENDERER__: build
					? renderings.some((rendering) => rendering === 'fragment')
					: true,
				__2D_RENDERER__: build
					? renderings.some((rendering) => rendering === '2d')
					: true,
			},
		}),
		load(id) {
			if (build && skipFiles.includes(id)) {
				return { code: '', map: null };
			}
		},
	};
}
