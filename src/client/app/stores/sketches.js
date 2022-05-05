import { writable } from "svelte/store";
import { sketches, onSketchReload } from "@fragment/sketches";

export const current = writable(sketches);
export const names = Object.keys(sketches);

onSketchReload(({ sketches }) => {
	current.update(() => sketches);
});
