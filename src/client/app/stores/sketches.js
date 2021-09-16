import { writable } from "svelte/store";
import { sketches } from "@fragment/sketches";

export const current = writable(sketches);
