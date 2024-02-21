import { ConfirmPrompt, SelectPrompt, TextPrompt } from '@clack/core';
import isUnicodeSupported from 'is-unicode-supported';
import * as color from 'kleur/colors';

const unicode = isUnicodeSupported();

/**
 * @param {string} c
 * @param {string} fallback
 * @returns {string}
 */
const s = (c, fallback) => (unicode ? c : fallback);

const S_RADIO_ACTIVE = s('●', '>');
const S_RADIO_INACTIVE = s('○', ' ');

const S_BAR_H = s('─', '-');
const S_CORNER_TOP_LEFT = s('╭', '+');
const S_CORNER_TOP_RIGHT = s('╮', '+');
const S_CORNER_BOTTOM_RIGHT = s('╯', '+');
const S_CORNER_BOTTOM_LEFT = s('╰', '+');
const S_BAR = s('│', '|');

/**
 * @param {object} opts
 * @param {string} opts.active
 * @param {string} opts.inactive
 * @param {boolean} opts.initialValue
 * @returns {Promise<boolean|symbol>}
 */
export const confirm = (opts) => {
	const active = opts.active ?? 'Yes';
	const inactive = opts.inactive ?? 'No';

	return new ConfirmPrompt({
		active,
		inactive,
		initialValue: opts.initialValue ?? true,
		render() {
			const title = `${opts.message}\n`;
			const value = this.value ? active : inactive;

			switch (this.state) {
				case 'submit':
					return `${color.dim(title)} ${color.green(value)}\n`;
				case 'cancel':
					return `${title}${color.strikethrough(color.dim(value))}\n`;
				default: {
					return `${title} ${
						this.value
							? `${S_RADIO_ACTIVE} ${active}`
							: `${color.dim(S_RADIO_INACTIVE)} ${color.dim(active)}`
					} ${color.dim('/')} ${
						!this.value
							? `${S_RADIO_ACTIVE} ${inactive}`
							: `${color.dim(S_RADIO_INACTIVE)} ${color.dim(inactive)}`
					}\n`;
				}
			}
		},
	}).prompt();
};

/**
 * @param {object} opts
 * @param {string} opts.message
 * @param {string} [opts.placeholder]
 * @param {string} [opts.defaultValue]
 * @param {string} [opts.initialValue]
 * @param {string} [opts.initialValue]
 * @param {function} [opts.validate]
 * @returns {Promise<string|symbol>}
 */
export const text = (opts) => {
	const { hint = '' } = opts;

	return new TextPrompt({
		validate: opts.validate,
		placeholder: opts.placeholder,
		defaultValue: opts.defaultValue,
		initialValue: opts.initialValue,
		render() {
			const title = `${opts.message}\n`;
			const placeholder = opts.placeholder
				? color.inverse(opts.placeholder[0]) +
					color.dim(opts.placeholder.slice(1))
				: color.inverse(color.hidden('_'));
			const value = !this.value
				? `${placeholder} ${color.dim(hint)}`.trim()
				: this.valueWithCursor;

			switch (this.state) {
				case 'error':
					return `${title.trim()}\n${value}\n  ${color.yellow(this.error)}\n`;
				case 'submit':
					return `${color.dim(`${title}`)} ${color.green(this.value || opts.placeholder)}\n`;
				case 'cancel':
					return `${title} ${color.strikethrough(
						color.dim(this.value ?? ''),
					)}${this.value?.trim() ? '\n' : ''}`;
				default:
					return `${title} ${value}\n`;
			}
		},
	}).prompt();
};

const limitOptions = (params) => {
	const { cursor, options, style } = params;

	// We clamp to minimum 5 because anything less doesn't make sense UX wise
	const maxItems =
		params.maxItems === undefined ? Infinity : Math.max(params.maxItems, 5);
	let slidingWindowLocation = 0;

	if (cursor >= slidingWindowLocation + maxItems - 3) {
		slidingWindowLocation = Math.max(
			Math.min(cursor - maxItems + 3, options.length - maxItems),
			0,
		);
	} else if (cursor < slidingWindowLocation + 2) {
		slidingWindowLocation = Math.max(cursor - 2, 0);
	}

	const shouldRenderTopEllipsis =
		maxItems < options.length && slidingWindowLocation > 0;
	const shouldRenderBottomEllipsis =
		maxItems < options.length &&
		slidingWindowLocation + maxItems < options.length;

	return options
		.slice(slidingWindowLocation, slidingWindowLocation + maxItems)
		.map((option, i, arr) => {
			const isTopLimit = i === 0 && shouldRenderTopEllipsis;
			const isBottomLimit =
				i === arr.length - 1 && shouldRenderBottomEllipsis;
			return isTopLimit || isBottomLimit
				? color.dim('...')
				: style(option, i + slidingWindowLocation === cursor);
		});
};

/**
 * @typedef {string|boolean|number} Value
 */

/**
 * @typedef {Object} Option
 * @property {string} value
 * @property {string} [label]
 * @property {string} [hint]
 */

/**
 * @param {object} opts
 * @param {string} opts.message
 * @param {Option<Value>[]} opts.options
 * @param {Value} [opts.initialValue]
 * @param {number} [opts.maxItems]
 * @returns {Promise<boolean|symbol>}
 */
export const select = (opts) => {
	/**
	 *
	 * @param {Option<Value>} option
	 * @param {'inactive' | 'active' | 'selected' | 'cancelled'} state
	 * @returns {string}
	 */
	const opt = (option, state) => {
		const label = option.label ?? String(option.value);
		switch (state) {
			case 'selected':
				return `${label}`;
			case 'active':
				return `${color.green(S_RADIO_ACTIVE)} ${label} ${
					option.hint ? color.dim(`(${option.hint})`) : ''
				}`;
			case 'cancelled':
				return `${color.strikethrough(color.dim(label))}`;
			default:
				return `${color.dim(S_RADIO_INACTIVE)} ${color.dim(label)}`;
		}
	};

	return new SelectPrompt({
		options: opts.options,
		initialValue: opts.initialValue,
		render() {
			const title = `${opts.message}\n`;

			switch (this.state) {
				case 'submit':
					return `${color.dim(title)} ${color.green(opt(this.options[this.cursor], 'selected'))}\n`;
				case 'cancel':
					return `${title} ${opt(
						this.options[this.cursor],
						'cancelled',
					)}\n`;
				default: {
					return `${title} ${limitOptions({
						cursor: this.cursor,
						options: this.options,
						maxItems: opts.maxItems,
						style: (item, active) =>
							opt(item, active ? 'active' : 'inactive'),
					}).join(`\n`)}\n`;
				}
			}
		},
	}).prompt();
};

function ansiRegex() {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
	].join('|');

	return new RegExp(pattern, 'g');
}

/**
 * @param {string} str
 * @returns {string}
 */
const strip = (str) => str.replace(ansiRegex(), '');

/**
 * @param {string} message
 * @param {string} title
 */
export const note = (message = '', title = '') => {
	const lines = `\n${message}\n`.split('\n');
	const titleLen = strip(title).length;
	const len =
		Math.max(
			lines.reduce((sum, ln) => {
				ln = strip(ln);
				return ln.length > sum ? ln.length : sum;
			}, 0),
			titleLen,
		) + 2;
	const msg = lines
		.map(
			(ln) =>
				`${color.gray(S_BAR)}  ${ln}${' '.repeat(len - strip(ln).length)}${color.gray(
					S_BAR,
				)}`,
		)
		.join('\n');

	const head = title ? ` ${title} ` : `${color.gray(S_BAR_H.repeat(2))}`;

	process.stdout.write(
		`${color.gray(S_CORNER_TOP_LEFT + S_BAR_H)}${head}${color.gray(
			S_BAR_H.repeat(Math.max(len - titleLen - 1, 1)) +
				S_CORNER_TOP_RIGHT,
		)}\n${msg}\n${color.gray(S_CORNER_BOTTOM_LEFT + S_BAR_H.repeat(len + 2) + S_CORNER_BOTTOM_RIGHT)}\n`,
	);
};
