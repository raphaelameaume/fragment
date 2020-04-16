import App from './App.svelte';
import { emit } from "./events";
import THREERenderer from './renderers/three/THREERenderer';
import parseParams from "./utils/parseParams.js";
import { Storage} from "./core/Storage.js";
import { Time } from "./core/Time.js";

let params = parseParams(window.location.search.substring(1));

let timeOffset = 0;

Storage.rehydrate('timeOffset', (value) => {
	timeOffset = value;
});

let time = timeOffset;
let lastTime = performance.now();
let deltaTime = 0;



Time.set({ time, offset: timeOffset, delta: deltaTime });

function loop() {
	const now = performance.now();
	deltaTime = (now - lastTime);
	time += deltaTime;
	lastTime = now;

	Time.set({ time, offset: timeOffset, delta: deltaTime });

	emit('beforeframe', { time, deltaTime, timeOffset });
	emit('frame', { time, deltaTime, timeOffset });
	emit('afterframe', { time, deltaTime, timeOffset });

	Storage.set('timeOffset', time);

	requestAnimationFrame(loop);
}

loop();

function Fragment({ renderer, stages }) {
	return new App({
		target: document.body,
		props: {
			output: params.mode && params.mode === 'output',
			single: params.mode && params.mode === 'single',
			renderer,
			stages,
		}
	});
}

export { THREERenderer };

export default Fragment;