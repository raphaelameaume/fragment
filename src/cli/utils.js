import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { red } from 'kleur/colors';
import { log } from './log.js';

/** @type {string} */
export const packageManager = getPackageManager() || 'npm';

/**
 * From https://github.com/sveltejs/kit/blob/main/packages/create-svelte/utils.js#L56
 */
function getPackageManager() {
	if (!process.env.npm_config_user_agent) {
		return undefined;
	}
	const user_agent = process.env.npm_config_user_agent;
	const pm_spec = user_agent.split(' ')[0];
	const separator_pos = pm_spec.lastIndexOf('/');
	const name = pm_spec.substring(0, separator_pos);
	return name === 'npminstall' ? 'cnpm' : name;
}

/**
 * Create a directory without throwing error if it already exists
 * @param {string} dir
 */
export function mkdirp(dir) {
	try {
		fs.mkdirSync(dir, { recursive: true });
	} catch (e) {
		if (/** @type {any} */ (e).code === 'EEXIST') return;
		throw e;
	}
}

/** @param {string} path */
export function file(path) {
	return fileURLToPath(new URL(`${path}`, import.meta.url).href);
}

export function handleCancelledPrompt(prompt) {
	if (p.isCancel(prompt)) {
		log.error(`Cancelled`);
		process.exit(1);
	}
}

export function prettifyTime(milliseconds) {
	if (milliseconds > 999) {
		return (milliseconds / 1000).toFixed(2) + 's';
	} else {
		return milliseconds + 'ms';
	}
}
