import { green, yellow, grey, inverse, red } from 'kleur/colors';

/**
 * @typedef {Object} Logger
 * @property {(message?: string, prefix?: string) => void} message
 * @property {(message?: string, prefix?: string) => void} info
 * @property {(message?: string, prefix?: string) => void} success
 * @property {(message?: string, prefix?: string) => void} warn
 * @property {(message?: string, prefix?: string) => void} warning
 * @property {(message?: string, prefix?: string) => void} error
 * @property {(label: string) => string} prefix
 */

/** @type {Logger} */
export const log = {
	message: (message = '', prefix) => {
		const prefixed = prefix ? `${prefix} ` : ``;
		process.stdout.write(`${prefixed}${message}\n`);
	},
	info: (message = '', prefix) => {
		log.message(grey(`${message}`), prefix);
	},
	success: (message = '', prefix) => {
		log.message(green(`${message}`), prefix);
	},
	warn: (message = '', prefix) => {
		log.message(yellow(`${message}`), prefix);
	},
	/** alias for `log.warn()`. */
	warning: (message = '', prefix) => {
		log.warn(message, prefix);
	},
	error: (message = '', prefix) => {
		log.message(red(`${message}`), prefix);
	},
	prefix: (label) => {
		return inverse(` ${label} `);
	},
};

export {
	green,
	magenta,
	cyan,
	bold,
	grey,
	yellow,
	dim,
	red,
} from 'kleur/colors';
