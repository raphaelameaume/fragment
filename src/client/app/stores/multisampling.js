import { createStore } from "./utils";

export const multisampling = createStore("multisampling", [], {
	persist: true,
	reset: true,
});

export const threshold = createStore("threshold", 0, {
	persist: true,
	reset: false,
});

export const transition = createStore("transition", false, {
	persist: true,
	reset: false,
});
