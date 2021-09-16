import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

const key = "rendering";

export const current = writable({
    ...rehydrate(key, {
        width: 1920,
        height: 1080,
        dpr: 1,
        monitors: [],
    }, true)
});

current.subscribe(keepInSync(key));
