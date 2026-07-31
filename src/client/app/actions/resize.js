/**
 *
 * @param {HTMLElement} node
 * @param {() => void} callback
 * @returns
 */
export function resize(node, callback) {
	if (typeof callback !== 'function') return;

	/** @type {ResizeObserver | null} */
	let observer = new ResizeObserver(callback);

	observer.observe(node);

	return {
		destroy: () => {
			observer?.disconnect();
			observer = null;
		},
	};
}
