/**
 * Extract the file path from a shader string
 * @param {string} [shader=''] - The shader source code
 * @returns {string | null} The extracted file path, or null if not found
 */
export function getShaderPath(shader = '') {
	const match = shader.match(/<filepath:\/\/(.*)>/);
	return match && match[1];
}

/**
 * Remove the file path comment from a shader string
 * @param {string} shader - The shader source code
 * @param {string | null} [filepath] - Optional filepath to remove (defaults to extracted path)
 * @returns {string} The shader with the filepath comment removed
 */
export function removeShaderPath(shader, filepath = getShaderPath(shader)) {
	if (filepath) {
		return shader.replace(`// <filepath://${filepath}>`, '');
	}

	return shader;
}
