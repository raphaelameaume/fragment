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
			parseInt(match[1]),
			parseInt(match[2]),
			parseInt(match[3]),
			match[4] ? Number(match[4]) : 1];
	}

	return [];
}

export function stringToHex(color) {
	return componentsToHex(stringToComponents(color));
}

export function vecToComponents(color) {
	const match = color.match(/vec[3-4]?\((\d*(?:\.\d*?)), ?(\d*(?:\.\d*?)), ?(\d*(?:\.\d*))?(?:, ?(\d*(?:\.?\d*?))\))?/);

	if (match) {
		return [
			Math.min(255, Math.max(Math.round(Number(match[1]) * 255), 0)),
			Math.min(255, Math.max(Math.round(Number(match[2]) * 255), 0)),
			Math.min(255, Math.max(Math.round(Number(match[3]) * 255), 0)),
			match[4] ? Math.min(1, Math.max(Number(match[4]), 0)) : 1];
	}

	console.error(`color.vecToComponents :: cannot parse color`, color);

	return [];
}

export function vecToHex(color) {
	return componentsToHex(vecToComponents(color));
}

// https://stackoverflow.com/questions/39118528/rgb-to-hsl-conversion
export function rgbTohsl(r,g,b) {
  
}

export function hslToHSLComponents(color) {
	const match = color.match(/hsla?\((\d{1,3}), ?(\d{1,3})\%, ?(\d{1,3})\%\)?(?:, ?(\d*(?:\.?\d*?))\))?/);

	if (match) {
		const h = Math.min(360, Math.max(Number(match[1]), 0));
		const l = Math.min(100, Math.max(Number(match[2]), 0));
		const s = Math.min(100, Math.max(Number(match[3]), 0));
		const a = match[4] ? Math.min(1, Math.max(Number(match[4]), 0)) : 1;

		return [h, s, l, a];
	}

	console.error(`color.hslToHSLComponents :: cannot parse color`, color);
	return [];
}

export function hslToComponents(color) {
	const [h, s, l, a] = hslToHSLComponents(color);

	// monochromatic
	if (s === 0) { 
		const tl = l / 100 * 255;

		return [tl, tl, tl, a];
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		return [
			hue2rgb(p, q, h + 1 / 3),
			hue2rgb(p, q, h),
			hue2rgb(p, q, h - 1 / 3),
			a,
		];
	}
}

export function hlsToHex(color) {
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

export function toComponents(color) {
	if (isHexString(color)) return hexToComponents(color);
	if (isRGBAString(color) || isRGBString(color)) return stringToComponents(color);
	if (isVec3String(color) || isVec4String(color)) return vecToComponents(color);
	
	if (typeof color === "string") return nameToComponents(color);

	console.error(`color.toComponents :: cannot parse color`, color);
}

export function toVec3String(color) {
	return componentsToVec3String(toComponents(color));
}

export function toVec4String(color) {
	return componentsToVec4String(toComponents(color));
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

export function toHex(color) {
	if (isHexString(color)) return color;
	if (isRGBString(color)) return stringToHex(color);
	if (isRGBAString(color)) return stringToHex(color);
	if (isVec3String(color)) return vecToHex(color);
	if (isVec4String(color)) return vecToHex(color);
	if (!color.includes('rgb')) return nameToHex(color);

	console.error(`color.toHex :: cannot parse color`, color);
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

	return `rgb(${r}, ${g}, ${b})`;
}

export function componentsToRGBAString(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1 ] = components;

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function componentsToHSLComponents(components = []) {
	const [ r = 0, g = 0, b = 0 ] = components;

	let v = Math.max(r,g,b);
	let c = v-Math.min(r,g,b);
	let f = (1-Math.abs(v+v-c-1));
  	let h = c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
	h = 60*(h<0?h+6:h);

	let l = (f ? c/f : 0);
	let s = (v+v-c)/2;

	return [h, s, l];
}

export function hslToHSLString(components) {
	const [ h = 0, s = 0, l = 0] = components;

	return `hsl(${h}, ${s}%, ${l}%)`;
}

export function hslaToHSLAString(components) {
	const [ h = 0, s = 0, l = 0, a = 1] = components;

	return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export function componentsToHSLString(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1 ] = components;
	return hslToHSLString(componentsToHSLComponents([r, g, b]));
}

export function componentsToHSLAString(components = []) {
	const [ r = 0, g = 0, b = 0, a = 1 ] = components;
	return hslaToHSLAString(componentsToHSLComponents([r, g, b]));
}

export function componentToHex(c) {
	return c.toString(16).padStart(2, 0);
}

export function componentsToHex(components = []) {
	const [ r = 0, g = 0, b = 0 ] = components;

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

export function isHSLAString(color, isString = typeof color === "string") {
	return isString && color.includes("hsla");
}

export function isHSLString(color, isString = typeof color === "string") {
	return isString && color.includes("hsl");
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
	const components = nameToComponents(value);

	return components && components.length > 0;
}

export function isTHREE(value) {
	return value && value.isColor;
}

export function threeToHexString(value) {
	if (!isTHREE(value)) {
		console.error(`color.threeToHexString() : value is not an instance of THREE.Color`);
	}

	return `#${value.getHexString()}`;
}

export function isColor(value) {
	let isString = typeof value === "string";

	if (isHexString(value, isString)) return true;
	if (isRGBString(value, isString)) return true;
	if (isVec3String(value, isString)) return true;
	if (isVec4String(value, isString)) return true;
	if (isHSLString(value, isString)) return true;
	if (isRGBArray(value)) return true;
	if (isRGBAArray(value)) return true;
	if (isName(value)) return true;

	return false;
}

export const FORMATS = {
	HEX_STRING: "hex-string",
	RGB_STRING: "rgb-string",
	RGBA_STRING: "rgba-string",
	HSL_STRING: "hsl-string",
	HSLA_STRING: "hsla-string",
	RGB_ARRAY: "rgb-array",
	RGBA_ARRAY: "rgba-array",
	VEC3_STRING: "vec3-string",
	VEC4_STRING: "vec4-string",
	THREE: "three",
};

export function getColorFormat(value) {
	if (isTHREE(value)) return FORMATS.THREE;
	if (isHexString(value)) return FORMATS.HEX_STRING;
	if (isRGBAString(value)) return FORMATS.RGBA_STRING;
	if (isRGBString(value)) return FORMATS.RGB_STRING;
	if (isRGBArray(value)) return FORMATS.RGB_ARRAY;
	if (isRGBAArray(value)) return FORMATS.RGBA_ARRAY;
	if (isVec3String(value)) return FORMATS.VEC3_STRING;
	if (isVec4String(value)) return FORMATS.VEC4_STRING;
	if (isHSLAString(value)) return FORMATS.HSLA_STRING;
	if (isHSLString(value)) return FORMATS.HSL_STRING;
};
