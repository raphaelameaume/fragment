/**
 * Run a function maximum once per frame
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {Number} timeout
 * @returns {(...args: Parameters<T>) => void} debounced function
 */
export default function frameDebounce(fn, timeout = 100) {
	let lastTime = performance.now();
	let needCall = false;
	/** @type {number|null} */
	let _raf = null;
	/** @type {Parameters<T>|[]} */
	let a;

	function loop() {
		const now = performance.now();

		if (needCall) {
			needCall = false;
			lastTime = now;

			fn(...a);
			lastTime = now;
		}

		if (now - lastTime > timeout && _raf && _raf > -1) {
			cancelAnimationFrame(_raf);
			_raf = null;
		} else {
			_raf = requestAnimationFrame(loop);
		}
	}

	return (...args) => {
		needCall = true;
		a = args;

		if (!_raf) {
			loop();
		}
	};
}
