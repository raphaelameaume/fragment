/**
 * @typedef {import('./types/config').Config} Config
 */

/**
 * Declare config with full type inference support
 * @param {Config} config
 * @returns {Config}
 */
export function defineConfig(config = {}) {
	return config;
}
