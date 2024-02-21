import path from 'node:path';
import fs from 'node:fs';
import { preview as vitePreview } from 'vite';
import { bold, cyan, log, magenta } from './log.js';
import * as p from './prompts.js';

/**
 * Preview a sketch
 * @param {string} dir
 * @param {object} options
 * @param {boolean} options.open
 */
export async function preview(dir, options) {
	const cwd = process.cwd();
	const prefix = log.prefix('preview');

	const outDir = path.join(cwd, dir);

	try {
		if (!fs.existsSync(outDir)) {
			throw new Error(
				`Directory ${magenta(dir)} does not exist in ${cwd}`,
			);
		}

		log.message(`${magenta(outDir)}\n`, prefix);

		const previewServer = await vitePreview({
			build: {
				outDir,
			},
			preview: {
				host: true,
				open: options.open,
			},
		});

		const { resolvedUrls } = previewServer;

		let urls = ``;

		for (const url of resolvedUrls.local) {
			urls += `${bold('Local')}:   ${bold(cyan(url))}\n`;
		}

		for (const url of resolvedUrls.network) {
			urls += `${bold('Network')}: ${bold(cyan(url))}`;
		}

		p.note(urls);
	} catch (error) {
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
