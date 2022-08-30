/**
 * Map a value from one range to another
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 * @param {Number} nmin - The new minimum 
 * @param {Number} nmax - The new maximum 
 * @returns {Number} result
 */
export function map(value, min, max, nmin, nmax) {
    return ((value - min) / (max - min)) * (nmax - nmin) + nmin;
}

/**
 * Clamp a number between min and max
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Number} result
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

export function createUUID() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
