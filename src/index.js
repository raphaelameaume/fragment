/**
 * @typedef {import('./types/config').Config} Config
 */

/**
 * Type helper to make it easier to use fragment.config.js
 * @param {Config} config
 * @returns {Config}
 */
export function defineConfig(config = {}) {
	return config;
}
