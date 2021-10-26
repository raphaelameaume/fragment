import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

let key = "fragment.props";

export const current = writable({
	...rehydrate(key, {}, true)
});

current.subscribe(keepInSync(key));
