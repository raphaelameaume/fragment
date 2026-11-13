/**
 * @param {() => void} callback
 * @returns {import('svelte/attachments').Attachment<HTMLElement>}
 */
export function resize(callback) {
	return (node) => {
		if (typeof callback !== 'function') return;

		const observer = new ResizeObserver(callback);
		observer.observe(node);

		return () => observer.disconnect();
	};
}
