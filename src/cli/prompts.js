import { green, grey, yellow } from 'kleur/colors';
import { TextPrompt } from '@clack/core';

/**
 *
 * @param {import("@clack/core").TextOptions} opts
 */
export const text = (opts) => {
	return new TextPrompt({
		validate: opts.validate,
		placeholder: opts.placeholder,
		defaultValue: opts.defaultValue,
		initialValue: opts.initialValue,
		render() {
			const title = `${opts.message}\n`;
			const placeholder = grey(opts.placeholder);
			const value = !this.value ? placeholder : this.valueWithCursor;

			switch (this.state) {
				case 'error':
					return `${title.trim()}  ${value}\n  ${yellow(this.error)}\n`;
				case 'submit':
					return `${title}${green(this.value || opts.placeholder)}\n`;
				case 'cancel':
					return `${title}Cancelled`;
				default:
					return `${title}${value}\n`;
			}
		},
	}).prompt();
};

/**
 *
 * @param {import('@clack/core').TextOptions} opts
 */
export const select = (opts) => {
	return new SelectPrompt();
};

export { isCancel } from '@clack/core';
