import App from './App.svelte';
import { emit } from "./events";
import OGLRenderer from './_ogl/OGLRenderer';
import * as OGLstages from "./_ogl/stages/index.js";


const app = new App({
	target: document.body,
	props: {
		renderer: window.renderer ? window.renderer : OGLRenderer(),
		output: window.location.href.includes('output'),
		stages: OGLstages,
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