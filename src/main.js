import App from './App.svelte';
import { emit } from "./events";
import OGLRenderer from './renderers/OGLRenderer';
import * as stages from "./stages/index.js";


const app = new App({
	target: document.body,
	props: {
		renderer: OGLRenderer(),
		output: window.location.href.includes('output'),
		stages,
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