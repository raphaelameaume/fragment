import { green, yellow, grey, inverse, red } from 'kleur/colors';

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
