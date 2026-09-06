import { isColor } from './color.utils';

export const fieldTypes = {
	SELECT: 'select',
	NUMBER: 'number',
	VEC: 'vec',
	CHECKBOX: 'checkbox',
	TEXT: 'text',
	TEXTAREA: 'textarea',
	LIST: 'list',
	COLOR: 'color',
	BUTTON: 'button',
	DOWNLOAD: 'download',
	IMPORT: 'import',
	IMAGE: 'image',
	INTERVAL: 'interval',
	WRAPPER: 'wrapper',
	PALETTE: 'palette',
	GRADIENT: 'gradient',
	LINK: 'link',
	RADIO: 'radio',
};

/** @type string[] */
const types = Object.values(fieldTypes);

/**
 * @param {string} url
 * @returns {boolean}
 */
function isImageURL(url) {
	return (
		url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null ||
		url.startsWith('data:image')
	);
}

/**
 * @param {any} value
 * @returns {boolean}
 */
function isImage(value) {
	return (
		typeof value === HTMLImageElement ||
		(typeof value === 'string' && isImageURL(value))
	);
}

/**
 *
 * @param {any[]} value
 * @returns {boolean}
 */
function isGradient(value) {
	return value.every(
		(v) =>
			typeof v === 'object' &&
			typeof v.position === 'number' &&
			isColor(v.color),
	);
}

export function inferFieldType({ type, value, params, key }) {
	if (type) {
		if (types.includes(type)) {
			return type;
		}

		console.warn(`Field: type ${type} is invalid for ${key}`);
	} else if (params.options && Array.isArray(params.options)) {
		return 'select';
	} else {
		if (value === undefined || value === null) {
			console.warn(`Field: value ${value} for ${key}`);
			return undefined;
		}

		const isArray = Array.isArray(value);
		const isObject = !isArray && typeof value === 'object';
		const getKeys = (value) => {
			if (isArray) {
				return value.map((_, index) => index);
			}

			if (!isArray && !isObject) return [0];

			if (value.isVector3) {
				return ['x', 'y', 'z'];
			}

			if (value.isVector4 || value.isQuaternion) {
				return ['x', 'y', 'z', 'w'];
			}

			if (isObject) {
				return Object.keys(value);
			}
		};

		const getValues = (value, keys) => {
			if (!isObject && !isArray) {
				value = [value];
			}

			return keys.map((key) => value[key]);
		};

		const keys = getKeys(value);
		const values = getValues(value, keys);

		if (
			isArray &&
			values.length === 2 &&
			typeof params.min === 'number' &&
			typeof params.max === 'number'
		) {
			return fieldTypes.INTERVAL;
		} else if (isArray && isGradient(value)) {
			return fieldTypes.GRADIENT;
		} else if (isArray && values.every((v) => isColor(v))) {
			return fieldTypes.PALETTE;
		} else if (isColor(value)) {
			return fieldTypes.COLOR;
		} else if (typeof value === 'number') {
			return fieldTypes.NUMBER;
		} else if (typeof value === 'function') {
			return fieldTypes.BUTTON;
		} else if (typeof value === 'boolean') {
			return fieldTypes.CHECKBOX;
		} else if (typeof value === 'string') {
			if (isImage(value)) {
				return fieldTypes.IMAGE;
			}

			return fieldTypes.TEXT;
		} else {
			if (
				(isArray || isObject) &&
				values.every((v) => typeof v === 'number') &&
				values.length <= 4
			) {
				return fieldTypes.VEC;
			}
		}
	}

	console.warn(`Field: cannot find field type for ${key}`);
}

/**
 * @typedef MatchFolderResult
 * @property {string} id
 * @property {string} parentId
 * @property {string} [name]
 * @property {number} depth
 * @property {boolean} isCurrent
 * @property {string} [rootId]
 * @property {{ collapsed: boolean}} [attributes]
 */

/**
 *
 * @param {string} folder
 */
export function parseFolder(folder) {
	const segments = folder.split('.');
	const regex = /(?<name>[^\[]+)(?:\[(?<attributes>[^\]]+)\])?/;

	const matches = segments
		.map((segment) => {
			const match = segment.match(regex);

			if (match) {
				return {
					name: match.groups?.name,
					attributes: match.groups?.attributes
						? Object.fromEntries(
								match.groups.attributes
									.split(', ')
									.map((attr) =>
										attr
											.split('=')
											.map((v) =>
												v === 'false'
													? false
													: v === 'true'
														? true
														: v,
											),
									),
							)
						: {},
				};
			}
		})
		.filter((result) => result !== undefined);

	let names = matches.map((match) => match.name);

	/** @type {string|undefined} */
	let rootId;

	/** @type {MatchFolderResult[]} */
	let results = [];

	matches.forEach((match, index) => {
		let id = [...names].slice(0, index + 1).join('.');
		let parentId = [...names].slice(0, index).join('.');

		if (index === 0) {
			rootId = id;
		}

		/** @type {MatchFolderResult} */
		let result = {
			id,
			parentId,
			depth: index,
			isCurrent: index === matches.length - 1,
			rootId,
			name: match.name,
			attributes: match.attributes,
		};

		results.push(result);
	});

	return results;
}
