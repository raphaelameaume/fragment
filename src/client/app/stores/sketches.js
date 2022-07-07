import { writable } from "svelte/store";
import { sketches, onSketchReload } from "@fragment/sketches";

export const all = writable(sketches);
export const names = Object.keys(sketches);

onSketchReload(({ sketches }) => {
	all.update(() => sketches);
});

export const current = writable([...names]);
