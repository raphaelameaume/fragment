import fs from 'node:fs';
import path from 'node:path';
import { log } from '../log.js';
import { bold, cyan, grey, yellow } from 'kleur/colors';
import { packageManager } from '../utils.js';
import * as p from '../prompts.js';

/**
 *
 * @param {object} params
 * @param {string} params.cwd - Current working directory
 * @param {string} params.app - App directory
 * @param {string[]} params.entriesPaths - Absolute entries paths
 * @param {boolean} params.build - Building for production
 * @returns {import('vite').Plugin}
 */
export default function checkDependencies({
	cwd = process.cwd(),
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
					console.log(
						yellow(`
It looks like you're trying to build a sketch with the following dependency: ${bold(dependency)}. It needs to be installed before running Fragment.
					`),
					);

					console.log(
						`Follow the next steps to start running ${filename} with Fragment:\n`,
					);

					p.note(
						`${grey(`1. Install dependencies`)}\n${cyan(`${packageManager} install ${dependency}`)}\n${grey(`2. Start Fragment`)}\n${cyan(`fragment ${filename}`)}`,
					);

					process.exit(1);
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
