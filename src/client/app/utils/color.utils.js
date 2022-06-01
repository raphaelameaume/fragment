/**
 * 
 * @param {string} colorName 
 */
export function nameToRGBA(colorName, element = "temp") {
	if (colorName.toLowerCase() === "transparent") return [0, 0, 0, 0];

	let temp = document.body.appendChild(document.createElement(element));
	let flag = 'rgb(1, 2, 3)';
	temp.style.color = flag;
	if (temp.style.color !== flag) return; // an override exists
	temp.style.color = colorName;
	if (temp.style.color === flag || temp.style.color === '') return; // parse failed

	let color = getComputedStyle(temp).color;
	document.body.removeChild(temp);

	return stringToRGBA(color);
}

/**
 * 
 * @param {string} value
 * @return {array}
 */
export function stringToRGBA(color) {
	const match = color.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);

	if (match) {
		return [
			parseInt(match[1]),
			parseInt(match[2]),
			parseInt(match[3]),
			match[4] ? parseInt(match[4]) : 1];
	}

	return [null, null, null, null];
}

export function hexToRGBA(color) {
	if (color.length < 7){
		const R = color[1];
		const G = color[2];
		const B = color[3];

		if (color.length > 4) {
			const A = color[4];

			color = `#${R}${R}${G}${G}${B}${B}${A}${A}`;
		} else {
			color = `#${R}${R}${G}${G}${B}${B}`;
		}
    }

    return [
		parseInt(color.substr(1, 2), 16),
        parseInt(color.substr(3, 2), 16),
		parseInt(color.substr(5, 2), 16),
		color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1
	];
}

export function colorToRGBA(color) {
	if (color[0] === "#") return hexToRGBA(color);
	if (!color.includes('rgb')) return nameToRGBA(color);
	if (color.includes('rgb')) return stringToRGBA(color);
}

export function colorToHex(color) {
	if (color[0] === "#") return color;
	if (!color.includes('rgb')) return nameToHex(color);
	if (color.includes('rgb')) return stringToHex(color);
}

export function colorToRGBString(color) {
	const [r, g, b] = colorToRGBA(color);

	return `rgb(${r}, ${g}, ${b})`;
}

export function colorToRGBAString(color) {
	const [r, g, b, a] = colorToRGBA(color);

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function stringToHex(color) {
	return rgbToHex(stringToRGBA(color));
}

export function nameToHex(color) {
	return rgbToHex(nameToRGBA(color));
}

export function componentToHex(c) {
	return c.toString(16).padStart(2, 0);
}

export function rgbToHex(components = [0, 0, 0]) {
	const [r, g, b] = components;

	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function isHexString(color, isString = typeof color === "string") {
	return isString && color[0] === "#";
}

export function isRGBAString(color, isString = typeof color === "string") {
	return isString && color.includes("rgba");
}

export function isRGBString(color, isString = typeof color === "string") {
	return isString && color.includes("rgb");
}

export function isRGBAArray(value) {
	return Array.isArray(value) && value.length === 4 && value.every((c, i) => i < 3 ? (c <= 255) : (c <= 1));
}

export function isRGBArray(value) {
	return Array.isArray(value) && value.length === 3 && value.every(c => c <= 255);
}

export function isName(value) {
	const components = nameToRGBA(value);

	return components && components.length > 0;
}

export function isColor(value) {
	let isString = typeof color === "string";

	if (isHexString(value, isString)) return true;
	if (isRGBString(value, isString)) return true;
	if (isRGBArray(value)) return true;
	if (isRGBAArray(value)) return true;
	if (isName(value)) return true;

	return false;
}

export const FORMATS = {
	HEX_STRING: "hex-string",
	RGB_STRING: "rgb-string",
	RGBA_STRING: "rgba-string",
	RGB_ARRAY: "rgb-array",
	RGBA_ARRAY: "rgba-array",
};

export function getColorFormat(value) {
	if (isHexString(value)) return FORMATS.HEX_STRING;
	if (isRGBAString(value)) return FORMATS.RGBA_STRING;
	if (isRGBString(value)) return FORMATS.RGB_STRING;
	if (isRGBArray(value)) return FORMATS.RGB_ARRAY;
	if (isRGBAArray(value)) return FORMATS.RGBA_ARRAY;
};
