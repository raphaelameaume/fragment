import { isColor } from './color.utils';

export const fieldTypes = {
	SELECT: 'select',
	NUMBER: 'number',
	VEC: 'vec',
	CHECKBOX: 'checkbox',
	TEXT: 'text',
	LIST: 'list',
	COLOR: 'color',
	BUTTON: 'button',
	DOWNLOAD: 'download',
	IMAGE: 'image',
	INTERVAL: 'interval',
};

/** @type string[] */
const types = Object.values(fieldTypes);

function isImageURL(url) {
	return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;
}

function isImage(value) {
	return typeof value === HTMLImageElement || isImageURL(value);
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
		const values = isObject ? Object.values(value) : value;

		if (
			isArray &&
			typeof params.min === 'number' &&
			typeof params.max === 'number'
		) {
			return fieldTypes.INTERVAL;
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

	console.warn(`Field: cannot find field type  for ${key}`);
}
