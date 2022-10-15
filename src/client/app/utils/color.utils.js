export const FORMATS = {
	HEX_STRING: "hex-string",
	RGB_STRING: "rgb-string",
	RGBA_STRING: "rgba-string",
	HSL_STRING: "hsl-string",
	HSLA_STRING: "hsla-string",
	RGB_OBJECT: "rgb-object",
	RGBA_OBJECT: "rgba-object",
	VEC3_STRING: "vec3-string",
	VEC4_STRING: "vec4-string",
	VEC3_ARRAY: "vec3-array",
	VEC4_ARRAY: "vec4-array",
	THREE: "three",
	CSS_COLOR: "css-color",
};

export function toHex(color, format = getColorFormat(color)) {
	if (!format) {
		console.error(`toHex :: cannot parse color for`, color);
	}

	if (format === FORMATS.THREE) return threeToHex(color);
	if (format === FORMATS.HEX_STRING) return color;
	if (format === FORMATS.HSL_STRING || format === FORMATS.HSLA_STRING) return hslToHex(color);
	if (format === FORMATS.RGB_STRING || format === FORMATS.RGBA_STRING) return stringToHex(color);
	if (format === FORMATS.RGB_OBJECT || format === FORMATS.RGBA_OBJECT) return componentsToHex([color.r, color.g, color.b, color.a]);
	if (format === FORMATS.VEC3_STRING || format === FORMATS.VEC4_STRING) return vecStringToHex(color);
	if (format === FORMATS.VEC3_ARRAY || format === FORMATS.VEC4_ARRAY) return vecArrayToHex(color);
	if (format === FORMATS.CSS_COLOR) return nameToHex(color);
}

export function toComponents(color, format = getColorFormat(color)) {
	if (!format) {
		console.error(`toComponents :: cannot parse color for`, color);
	}

	if (format === FORMATS.THREE) return [color.r, color.g, color.b, 1];
	if (format === FORMATS.HEX_STRING) return hexToComponents(color);
	if (format === FORMATS.HSL_STRING || format === FORMATS.HSLA_STRING) return hslToComponents(color);
	if (format === FORMATS.RGB_STRING || format === FORMATS.RGBA_STRING) return stringToComponents(color);
	if (format === FORMATS.RGB_OBJECT || format === FORMATS.RGBA_OBJECT) return [color.r, color.g, color.b, isFinite(color.a) ? color.a : 1];
	if (format === FORMATS.VEC3_STRING || format === FORMATS.VEC4_STRING) return vecStringToComponents(color);
	if (format === FORMATS.CSS_COLOR) return nameToComponents(color);
}

export function toString(color, format = getColorFormat(color)) {
	if (!format) {
		console.error(`toString :: cannot parse color for`, color);
	}

	if (
		format === FORMATS.HEX_STRING ||
		format === FORMATS.RGB_STRING ||
		format === FORMATS.RGBA_STRING ||
		format === FORMATS.HSL_STRING ||
		format === FORMATS.HSLA_STRING ||
		format === FORMATS.VEC3_STRING ||
		format === FORMATS.VEC4_STRING ||
		format === FORMATS.CSS_COLOR
	) return color;
	if (format === FORMATS.VEC3_ARRAY) return componentsToRGBString(vecArrayToComponents(color));
	if (format === FORMATS.VEC4_ARRAY) return componentsToRGBAString(vecArrayToComponents(color));
	if (format === FORMATS.THREE) return threeToHex(color);
	if (format === FORMATS.RGB_OBJECT) return componentsToRGBString([color.r, color.g, color.b])
	if (format === FORMATS.RGBA_OBJECT) return componentsToRGBAString([color.r, color.g, color.b, color.a ? color.a : 1]);
}

/**
 * 
 * @param {string} colorName 
 */
export function nameToComponents(colorName, element = "temp") {
	if (colorName.toLowerCase() === "transparent") return [0, 0, 0, 0];

	let temp = document.createElement(element);
	document.body.appendChild(temp);

	const removeChild = () => temp.parentNode.removeChild(temp);

	let flag = 'rgb(1, 2, 3)';
	temp.style.color = flag;
	if (temp.style.color !== flag) {
		removeChild();
		return;
	}
	temp.style.color = colorName;

	// parse failed
	if (temp.style.color === flag || temp.style.color === '') {
		removeChild();
		return;
	}

	let color = getComputedStyle(temp).color;
	removeChild();

	return stringToComponents(color);
}

export function nameToHex(color) {
	return componentsToHex(nameToComponents(color));
}

/**
 * 
 * @param {string} value
 * @return {array}
 */
export function stringToComponents(color) {
	const match = color.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d*(?:\.?\d*?))\))?/);

	if (match) {
		return [
			parseInt(match[1]) / 255,
			parseInt(match[2]) / 255,
			parseInt(match[3]) / 255,
			match[4] ? Number(match[4]) : 1];
	}

	return [];
}

export function stringToHex(color) {
	return componentsToHex(stringToComponents(color));
}

export function vecStringToComponents(color) {
	const match = color.match(/vec[3-4]?\((\d*(?:\.\d*?)), ?(\d*(?:\.\d*?)), ?(\d*(?:\.\d*))?(?:, ?(\d*(?:\.?\d*?))\))?/);

	if (match) {
		return [
			Math.min(1, Math.max(Number(match[1]), 0)),
			Math.min(1, Math.max(Number(match[2]), 0)),
			Math.min(1, Math.max(Number(match[3]), 0)),
			match[4] ? Math.min(1, Math.max(Number(match[4]), 0)) : 1];
	}

	console.error(`color.vecStringToComponents :: cannot parse color`, color);

	return [];
}

export function vecArrayToComponents(color) {
	if (color.every((c) => isFinite(c))) {
		const [r, g, b, a = 1] = color;
		return [
			r,
			g,
			b,
			a
		];
	}

	console.error(`color.vecArrayToComponents :: cannot parse color`, color);

	return [];
}

export function vecStringToHex(color) {
	return componentsToHex(vecStringToComponents(color));
}

export function vecArrayToHex(color) {
	return componentsToHex(vecArrayToComponents(color));
}

// https://stackoverflow.com/questions/39118528/rgb-to-hsl-conversion
export function rgbTohsl(r,g,b) {
  
}

export function hslToHSLComponents(color) {
	const match = color.match(/hsla?\((\d{1,3}),?[\s]?(\d{1,3})\%,?[\s]?(\d{1,3})\%\)?(?:,?[\s]?(\d*(?:\.?\d*?))\))?/);

	if (match) {
		const h = Math.min(360, Math.max(Number(match[1]), 0));
		const s = Math.min(100, Math.max(Number(match[2]), 0));
		const l = Math.min(100, Math.max(Number(match[3]), 0));
		const a = match[4] ? Math.min(1, Math.max(Number(match[4]), 0)) : 1;

		return [h, s, l, a];
	}

	console.error(`color.hslToHSLComponents :: cannot parse color`, color);
	return [];
}

export function hslToComponents(color) {
	let [h, s, l, a = 1] = hslToHSLComponents(color);

	h = h % 360;

	if (h < 0) {
		h += 360;
	}

	s /= 100;
	l /= 100;

	function f(n) {
		let k = (n + h/30) % 12;
		let a = s * Math.min(l, 1 - l);
		return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
	}

	return [f(0), f(8), f(4), a];
}

export function hslToHex(color) {
	return componentsToHex(hslToComponents(color));
};

export function hexToComponents(color) {
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
		parseInt(color.substr(1, 2), 16) / 255,
        parseInt(color.substr(3, 2), 16) / 255,
		parseInt(color.substr(5, 2), 16) / 255,
		color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1
	];
}

/**
 * Convert a hexadecimal string to 
 * @param {string} color 
 * @returns 
 */
export function hexToVec3String(color) {
	return componentsToVec3String(hexToComponents(color));
}

export function hexToVec4String(color) {
	return componentsToVec4String(hexToComponents(color));
}

export function hexToHSLString(color) {
	return componentsToHSLString(hexToComponents(color));
}

export function hexToHSLAString(color) {
	return componentsToHSLAString(hexToComponents(color));
}

export function toVec3String(color) {
	return componentsToVec3String(toComponents(color));
}

export function toVec4String(color) {
	return componentsToVec4String(toComponents(color));
}

export function componentsToVec3String(components = []) {
	const [ r = 0, g = 0, b = 0] = components;

	let rn = `${Math.round(r * 1000) / 1000}`;
	let gn = `${Math.round(g * 1000) / 1000}`;
	let bn = `${Math.round(b * 1000) / 1000}`;

	if (r === 1 || r === 0) {
		rn = `${r}.0`;
	}

	if (g === 1 || g === 0) {
		gn = `${g}.0`;
	}

	if (b === 1 || b === 0) {
		bn = `${b}.0`;
	}

	return `vec3(${rn}, ${gn}, ${bn})`;
}

export function componentsToVec4String(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1] = components;

	let rn = `${Math.round(r * 1000) / 1000}`;
	let gn = `${Math.round(g * 1000) / 1000}`;
	let bn = `${Math.round(b * 1000) / 1000}`;
	let an = `${a}`;

	if (r === 1 || r === 0) {
		rn = `${r}.0`;
	}

	if (g === 1 || g === 0) {
		gn = `${g}.0`;
	}

	if (b === 1 || b === 0) {
		bn = `${b}.0`;
	}

	if (a === 1 || a === 0) {
		an = `${an}.0`;
	}

	return `vec4(${rn}, ${gn}, ${bn}, ${an})`;
}

export function toRGBString(color) {
	const [r, g, b] = toComponents(color);

	return componentsToRGBString([r, g, b]);
}

export function toRGBAString(color) {
	return componentsToRGBAString(toComponents(color));
}

export function hexToRGBString(color) {
	return componentsToRGBString(hexToComponents(color));
}

export function hexToRGBAString(color) {
	return componentsToRGBString(hexToComponents(color));
}

export function componentsToRGBString(components) {
	const [ r, g, b ] = components;

	return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

export function componentsToRGBAString(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1 ] = components;

	return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

export function componentsToHSLComponents(components = []) {
	let [r, g, b] = components;
	let max = Math.max(...components);
	let min = Math.min(...components);
	let [h, s, l] = [NaN, 0, (min + max)/2];
	let d = max - min;

	if (d !== 0) {
		s = (l === 0 || l === 1) ? 0 : (max - l) / Math.min(l, 1 - l);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4;
		}

		h = h * 60;
	}

	if (s === 0 || l === 0) {
		h = 0;
	}

	return [h, s * 100, l * 100];
}

export function hslToHSLString(components) {
	const [ h = 0, s = 0, l = 0] = components;

	return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function hslaToHSLAString(components) {
	const [ h = 0, s = 0, l = 0, a = 1] = components;

	return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
}

export function componentsToHSLString(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1 ] = components;
	return hslToHSLString(componentsToHSLComponents([r, g, b]));
}

export function componentsToHSLAString(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1 ] = components;
	const [ h, s, l] = componentsToHSLComponents([r, g, b]);
	return hslaToHSLAString([h, s, l, a]);
}

export function componentToHex(c) {
	return c.toString(16).padStart(2, 0);
}

export function componentsToHex(components = []) {
	const [ r = 0, g = 0, b = 0 ] = components;

	let hex = [r, g, b]
		.map((c) => Math.round(c * 255))
		.map(c => {
			return c.toString(16).padStart(2, "0");
		}).join("");

	return `#${hex}`;
}

export function isHexString(value, isString = typeof value === "string") {
	return isString && /^#([a-f0-9]{3,4}){1,2}$/i.test(value);
}

export function isRGBAString(value, isString = typeof value === "string") {
	return isString && /rgba\((\d{1,3}),[\s]*(\d{1,3}),[\s]*(\d{1,3})\)?(?:,[\s]*(\d*(?:\.?\d*?))\))?/.test(value);
}

export function isRGBString(value, isString = typeof value === "string") {
	return isString && /rgb\((\d{1,3}),[\s]*(\d{1,3}),[\s]*(\d{1,3})\)/.test(value);
}

export function isHSLAString(value, isString = typeof value === "string") {
	return isString && value.includes("hsla");
}

export function isHSLString(value, isString = typeof value === "string") {
	return isString && value.includes("hsl");
}

export function isVec3String(value, isString = typeof value === "string") {
	return isString && value.includes("vec3(");
}

export function isVec4String(value, isString = typeof value === "string") {
	return isString && value.includes("vec4(");
}

export function isRGBAObject(value) {
	if (typeof value === "object") {
		const keys = Object.keys(value);

		return keys.length === 4 &&
			keys.includes('r') &&
			keys.includes('g') &&
			keys.includes('b') &&
			keys.includes('a');
	}

	return false;
}

export function isRGBObject(value) {
	if (typeof value === "object") {
		const keys = Object.keys(value);

		return keys.length === 3 &&
			keys.includes('r') &&
			keys.includes('g') &&
			keys.includes('b');
	}

	return false;
}

export function isVec3Array(value) {
	if (Array.isArray(value)) {
		return value.length == 3 && value.every(c => c >= 0 && c <= 1);
	}

	return false;
}

export function isVec4Array(value) {
	if (Array.isArray(value)) {
		return value.length == 4 && value.every(c => c >= 0 && c <= 1);
	}

	return false;
}

export function isCSSColor(value, isString = typeof value === "string") {
	const components = isString && nameToComponents(value);

	return components && components.length > 0;
}

export function isTHREE(value) {
	return value && value.isColor;
}

export function threeToHex(value) {
	if (!isTHREE(value)) {
		console.error(`color.threeToHex() : value is not an instance of THREE.Color`);
	}

	return `#${value.getHexString()}`;
}

export function isColor(value) {
	let isString = typeof value === "string";

	if (isTHREE(value)) return true;
	if (isHexString(value, isString)) return true;
	if (isRGBString(value, isString)) return true;
	if (isVec3String(value, isString)) return true;
	if (isVec4String(value, isString)) return true;
	if (isHSLString(value, isString)) return true;
	if (isRGBAObject(value)) return true;
	if (isRGBObject(value)) return true;
	if (isCSSColor(value)) return true;

	return false;
}


export function getColorFormat(value) {
	if (isTHREE(value)) return FORMATS.THREE;
	if (isHexString(value)) return FORMATS.HEX_STRING;
	if (isRGBAString(value)) return FORMATS.RGBA_STRING;
	if (isRGBString(value)) return FORMATS.RGB_STRING;
	if (isRGBObject(value)) return FORMATS.RGB_OBJECT;
	if (isRGBAObject(value)) return FORMATS.RGBA_OBJECT;
	if (isVec3String(value)) return FORMATS.VEC3_STRING;
	if (isVec4String(value)) return FORMATS.VEC4_STRING;
	if (isVec3Array(value)) return FORMATS.VEC3_ARRAY;
	if (isVec4Array(value)) return FORMATS.VEC4_ARRAY;
	if (isHSLAString(value)) return FORMATS.HSLA_STRING;
	if (isHSLString(value)) return FORMATS.HSL_STRING;
	if (isCSSColor(value)) return FORMATS.CSS_COLOR;
};
