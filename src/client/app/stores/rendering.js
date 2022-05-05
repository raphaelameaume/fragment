import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

const key = "rendering";

export const SIZES = {
    FIXED: "fixed",
    ASPECT_RATIO: "aspect-ratio",
    MONITOR: "monitor",
};

export const current = writable({
    ...rehydrate(key, {
        width: 500,
        height: 500,
        pixelRatio: 1,
        resizing: SIZES.FIXED,
        aspectRatio: 1,
    }, false)
});

current.subscribe(keepInSync(key));

export const threshold = writable(rehydrate("threshold", 0, true));
threshold.subscribe(keepInSync("threshold"));

export const monitors = writable(0);
