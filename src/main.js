import App from './App.svelte';
import { emit } from "./events";
import OGLRenderer from './_ogl/OGLRenderer';
import * as OGLstages from "./_ogl/stages/index.js";
// import THREERenderer from './_three/THREERenderer';
// import * as THREEstages from "./_three/stages/index.js";
import parseParams from "./utils/parseParams.js";

let params = parseParams(window.location.search.substring(1));

const app = new App({
	target: document.body,
	props: {
		output: params.mode && params.mode === 'output',
		single: params.mode && params.mode === 'single',
		renderer: OGLRenderer({ width: 1280 * 1, height: 720 * 1, dpr: 1 }),
		// renderer: OGLRenderer({ dpr: 2 }),
		stages: OGLstages,
		// renderer: THREERenderer(),
		// stages: THREEstages,
	}
});

let time = 0;
let lastTime = performance.now();
let deltaTime = 0;

function loop() {
	const now = performance.now();
	deltaTime = (now - lastTime);
	time += deltaTime;
	lastTime = now;

	emit('beforeframe', { time, deltaTime });
	emit('frame', { time, deltaTime });
	emit('afterframe', { time, deltaTime });

	requestAnimationFrame(loop);
}

loop();

export default app;