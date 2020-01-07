import App from './App.svelte';
import { emit } from "./events";


const app = new App({
	target: document.body,
	props: {
		name: 'world'
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

	emit('frame', { time, deltaTime });

	requestAnimationFrame(loop);
}

loop();

export default app;