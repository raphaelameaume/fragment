import { writable } from "svelte/store";
import { keepInSync, rehydrate } from "./utils";

const key = "rendering";

export const SIZES = {
    FIXED: "fixed",
    PRESET: "preset",
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
        preset: 'a4',
        pixelsPerInch: 300
    }, true)
});

keepInSync(key, current);

export const threshold = writable(rehydrate("fragment.threshold", 0, false));
keepInSync("fragment.threshold", threshold);

export const monitors = writable([]);
export const canvases = writable([]);

/* multisampling store */
export const multisampling = writable(rehydrate("multisampling", [], true));
keepInSync("multisampling", multisampling);
