import App from './App.svelte';
import { emit } from "./events";
import OGLRenderer from './_ogl/OGLRenderer';
import * as OGLstages from "./_ogl/stages/index.js";
// import THREERenderer from './_three/THREERenderer';
// import * as THREEstages from "./_three/stages/index.js";
import parseParams from "./utils/parseParams.js";
import { Storage} from "./core/Storage.js";
import { Time } from "./core/Time.js";

let params = parseParams(window.location.search.substring(1));

let renderer = OGLRenderer({ width: 1280 * 1, height: 720 * 1, dpr: 1 });

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

const app = new App({
	target: document.body,
	props: {
		output: params.mode && params.mode === 'output',
		single: params.mode && params.mode === 'single',
		renderer: renderer,
		stages: OGLstages,
		propTypes: [
			{
				type: 'image',
				actions: [
					{ 
						label: 'Set last frame',
						onClick: (prop) => {
							prop.value = 'LAST_FRAME';
							prop.needsUpdate = true;
							console.log(prop);
						}
					}
				]
			}
		],
	}
});

export default app;