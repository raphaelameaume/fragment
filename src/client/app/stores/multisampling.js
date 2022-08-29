import { createStore } from "./utils";

export const multisampling = createStore("multisampling", [], {
	persist: !__PRODUCTION__,
	reset: true,
});

export const threshold = createStore("threshold", 0, {
	persist: !__PRODUCTION__,
	reset: false,
});

export const transition = createStore("transition", false, {
	persist: !__PRODUCTION__,
	reset: false,
});
