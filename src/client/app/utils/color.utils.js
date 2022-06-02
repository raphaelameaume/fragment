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
	const match = color.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d+?))\))?/);

	if (match) {
		return [
			parseInt(match[1]),
			parseInt(match[2]),
			parseInt(match[3]),
			match[4] ? Number(match[4]) : 1];
	}

	return [];
}

export function vecToRGBA(color) {
	const match = color.match(/vec[3-4]?\((\d*(?:\.\d*?)), ?(\d*(?:\.\d*?)), ?(\d*(?:\.\d*))?(?:, ?(\d(?:\.\d*?))\))?/);

	if (match) {
		return [
			Math.min(255, Math.max(Math.round(Number(match[1]) * 255), 0)),
			Math.min(255, Math.max(Math.round(Number(match[2]) * 255), 0)),
			Math.min(255, Math.max(Math.round(Number(match[3]) * 255), 0)),
			match[4] ? Math.min(1, Math.max(Number(match[4]), 0)) : 1];
	}

	return [];
}

export function vecToHex(color) {
	return RGBAToHex(vecToRGBA(color));
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

/**
 * Convert a hexadecimal string to 
 * @param {string} color 
 * @returns 
 */
export function hexToVec3String(color) {
	return componentsToVec3String(hexToRGBA(color));
}

export function hexToVec4String(color) {
	return componentsToVec4String(hexToRGBA(color));
}

export function colorToRGBA(color) {
	if (isHexString(color)) return hexToRGBA(color);
	if (isRGBAString(color)) return stringToRGBA(color);
	if (isRGBString(color)) return stringToRGBA(color);
	if (isVec3String(color)) return vecToRGBA(color);
	if (isVec4String(color)) return vecToRGBA(color);
	
	if (!color.includes('rgb')) return nameToRGBA(color);

	console.error(`colorToRGBA :: cannot parse color.`);
}

export function colorToVec3String(color) {
	return componentsToVec3String(colorToRGBA(color));
}

export function colorToVec4String(color) {
	return componentsToVec4String(colorToRGBA(color));
}

export function componentsToVec3String(components = []) {
	const [ r = 0, g = 0, b = 0] = components;

	let rn = `${Math.round(r / 255 * 100000) / 100000}`;
	let gn = `${Math.round(g / 255 * 100000) / 100000}`;
	let bn = `${Math.round(b / 255 * 100000) / 100000}`;

	if (r === 255 || r === 0) {
		rn = `${rn}.0`;
	}

	if (g === 255 || g === 0) {
		gn = `${gn}.0`;
	}

	if (b === 255 || b === 0) {
		bn = `${bn}.0`;
	}

	return `vec3(${rn}, ${gn}, ${bn})`;
}

export function componentsToVec4String(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1] = components;

	let rn = `${Math.round(r / 255 * 100000) / 100000}`;
	let gn = `${Math.round(g / 255 * 100000) / 100000}`;
	let bn = `${Math.round(b / 255 * 100000) / 100000}`;
	let an = `${a}`;

	if (r === 255 || r === 0) {
		rn = `${rn}.0`;
	}

	if (g === 255 || g === 0) {
		gn = `${gn}.0`;
	}

	if (b === 255 || b === 0) {
		bn = `${bn}.0`;
	}

	if (a === 1 || a === 0) {
		an = `${an}.0`;
	}

	return `vec4(${rn}, ${gn}, ${bn}, ${an})`;
}

export function colorToHex(color) {
	if (isHexString(color)) return color;
	if (isRGBString(color)) return stringToHex(color);
	if (isRGBAString(color)) return stringToHex(color);
	if (isVec3String(color)) return vecToHex(color);
	if (isVec4String(color)) return vecToHex(color);
	if (!color.includes('rgb')) return nameToHex(color);
}

export function colorToRGBString(color) {
	const [r, g, b] = colorToRGBA(color);

	return RGBtoRGBString([r, g, b]);
}

export function hexToRGBString(color) {
	return RGBToRGBString(hexToRGBA(color));
}

export function hexToRGBAString(color) {
	return RGBAToRGBString(hexToRGBA(color));
}

export function colorToRGBAString(color) {
	return RGBAToRGBAString(colorToRGBA(color));
}

export function RGBtoRGBString(components) {
	const [ r, g, b ] = components;

	return `rgb(${r}, ${g}, ${b})`;
}

export function RGBAToRGBAString(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1 ] = components;

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function RGBAToHex(components) {
	return RGBToHex(components);
}

export function stringToHex(color) {
	return RGBToHex(stringToRGBA(color));
}

export function nameToHex(color) {
	return RGBToHex(nameToRGBA(color));
}

export function componentToHex(c) {
	return c.toString(16).padStart(2, 0);
}

export function RGBToHex(components = [0, 0, 0]) {
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

export function isVec3String(color, isString = typeof color === "string") {
	return isString && color.includes("vec3(");
}

export function isVec4String(color, isString = typeof color === "string") {
	return isString && color.includes("vec4(");
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
	let isString = typeof value === "string";

	if (isHexString(value, isString)) return true;
	if (isRGBString(value, isString)) return true;
	if (isVec3String(value, isString)) return true;
	if (isVec4String(value, isString)) return true;
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
	VEC3_STRING: "vec3-string",
	VEC4_STRING: "vec4-string",
};

export function getColorFormat(value) {
	if (isHexString(value)) return FORMATS.HEX_STRING;
	if (isRGBAString(value)) return FORMATS.RGBA_STRING;
	if (isRGBString(value)) return FORMATS.RGB_STRING;
	if (isRGBArray(value)) return FORMATS.RGB_ARRAY;
	if (isRGBAArray(value)) return FORMATS.RGBA_ARRAY;
	if (isVec3String(value)) return FORMATS.VEC3_STRING;
	if (isVec4String(value)) return FORMATS.VEC4_STRING;
};
