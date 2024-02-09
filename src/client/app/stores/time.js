import { readable } from 'svelte/store';

export const current = readable({ time: 0, deltaTime: 0 }, (set) => {
	let _raf;
	let lastTime = performance.now();
	let startTime = lastTime - __START_TIME__;
	let time = startTime;

	function update(dt = 0) {
		lastTime = time;

		let currentTime = performance.now();
		let deltaTime = currentTime - lastTime;

		time = currentTime;

		set({ time, deltaTime, startTime });

		_raf = requestAnimationFrame(update);
	}

	update();

	return () => {
		cancelAnimationFrame(_raf);
	};
});
