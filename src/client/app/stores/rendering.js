import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

const key = "rendering";

export const current = writable({
    ...rehydrate(key, {
        width: 500,
        height: 250,
        pixelRatio: 1,
        monitors: 0,
    }, true)
});

current.subscribe(keepInSync(key));

export const threshold = writable(rehydrate("threshold", 0, true));
threshold.subscribe(keepInSync("threshold"));
