export function resize(node, callback) {
	if (typeof callback !== 'function') return;

	let observer = new ResizeObserver(callback);

	observer.observe(node);

	return {
		destroy: () => {
			observer.disconnect();
			observer = null;
		},
	};
}
