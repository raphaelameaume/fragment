import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

export let syncable = true;
export let key = "fragment.props";

export const store = writable({
	...rehydrate(key, {}, true)
});

keepInSync(key, store);
