import kleur from 'kleur';
import { inverse } from 'kleur/colors';

let _prefix = kleur.grey('[fragment] ');

export const log = {
	message: (message = '') => {
		process.stdout.write(`${message}\n`);
	},
	info: (message = '') => {
		log.message(message);
	},
	success: (message = '') => {
		log.message(kleur.green(`${message}`));
	},
	warn: (message = '') => {
		log.message(kleur.yellow(`${message}`));
	},
	/** alias for `log.warn()`. */
	warning: (message = '') => {
		log.warn(message);
	},
	error: (message = '') => {
		log.message(kleur.red(`${message}`));
	},
	task: (name) => {
		return {
			message: (message) => {
				log.message(`${inverse(` ${name} `)} ${message}`);
			},
		};
	},
	createPrefix: (prefix) => {
		return kleur.grey(prefix);
	},
};
