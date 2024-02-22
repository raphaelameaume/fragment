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
			value.length === 2 &&
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

export function hasChanged(initialValue, currentValue) {
	const initialType = typeof initialValue;
	const currentType = typeof currentValue;

	if (initialType !== currentType) return true;

	if (Array.isArray(currentValue)) {
		if (initialValue.length !== currentValue.length) {
			return true;
		}

		for (let i = 0; i < currentValue.length; i++) {
			if (currentValue[i] !== initialValue[i]) {
				return true;
			}
		}
		return false;
	}

	if (initialType === 'object') {
		const keys1 = Object.keys(initialValue);
		const keys2 = Object.keys(currentValue);

		if (
			keys1.length !== keys2.length ||
			!keys1.every((key) => keys2.includes(key))
		) {
			return true;
		}

		for (const key of keys1) {
			const value1 = initialValue[key];
			const value2 = currentValue[key];

			if (typeof value1 === 'object' && typeof value2 === 'object') {
				// If both values are objects, recursively compare them
				if (hasChanged(value1, value2)) {
					return true;
				}
			} else if (value1 !== value2) {
				// If values are not objects, directly compare them
				return true;
			}

			return false;
		}
	}

	return initialValue !== currentValue;
}
