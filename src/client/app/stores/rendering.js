import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

const key = "rendering";

export const current = writable({
    ...rehydrate(key, {
        width: 500,
        height: 250,
        dpr: 1,
        monitors: 0,
    }, true)
});

current.subscribe(keepInSync(key));
