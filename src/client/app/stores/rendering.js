import { writable } from "svelte/store";
import { client } from "../client";
import { createStore } from "./utils";
import { getDimensionsForPreset } from "../lib/presets";

export const SIZES = {
    FIXED: "fixed",
    PRESET: "preset",
    ASPECT_RATIO: "aspect-ratio",
    WINDOW: "window",
    SCALE: "scale",
};

export const rendering = createStore(`rendering`, {
    width: 500,
    height: 500,
    pixelRatio: 1,
    resizing: SIZES.FIXED,
    aspectRatio: 1,
    scale: 1,
    preset: 'a4',
}, {
    persist: !__PRODUCTION__,
    reset: false, 
});

export const monitors = createStore('monitors', []);
export const preview = createStore('preview', null);

export const override = (config) => {
    const { canvasSize = SIZES.WINDOW } = config;
    const resizing = canvasSize;

    const overrides = {
        resizing,
    };

    if (config.dimensions && config.dimensions.length === 2) {
        const { dimensions } = config;
        overrides.width = dimensions[0];
        overrides.height = dimensions[1];

        if (!config.canvasSize) {
            overrides.resizing = SIZES.FIXED;
        }
    }

    if (resizing === SIZES.PRESET) {
        if (config.preset) {
            const [ width, height ] = getDimensionsForPreset(config.preset, { pixelsPerInch: 300 });

            overrides.width = width;
            overrides.height = height;
        } else {
            overrides.resizing = SIZES.WINDOW;
            console.warn(`Cannot apply canvasSize preset if 'preset' is not specified in config.`);
        }
    }

    if (resizing === SIZES.ASPECT_RATIO) {
        if (isNaN(config.aspectRatio)) {
            overrides.resizing = SIZES.WINDOW;
            console.warn(`Cannot apply canvasSize:"aspectRatio" if 'aspectRatio' is not specified in config.`);
        }
    }

    if (resizing === SIZES.SCALE) {
        if (!config.dimensions) {
            console.warn(`Cannot apply canvasSize:"scale" if no dimensions are specified.`);
            overrides.resizing = SIZES.WINDOW;
        }

        if (isNaN(config.scale)) {
            console.warn(`Cannot apply canvasSize:"scale" if 'scale' is not specified in config.`);
            overrides.resizing = SIZES.WINDOW;
        } else {
            overrides.scale = config.scale;
        }
    }

    if (config.pixelRatio) {
        const { pixelRatio } = config;
        overrides.pixelRatio = typeof pixelRatio === "function" ? pixelRatio() : pixelRatio;
    }

    // if (config.backgroundColor) {
    //     backgroundColor = config.backgroundColor;
    // }

    rendering.update((curr) => ({...curr, ...overrides}));
};

/* sync across clients */
let isSynchronized = false;

export const sync = writable(isSynchronized);

function checkForSync({ clientCount } = {}) {
    let prev = isSynchronized;
    isSynchronized = clientCount > 0;

    if (prev && !isSynchronized) {
        console.warn("[fragment] Sketch is running at specified framerate.");
    } else if (!prev && isSynchronized) {
        console.warn("[fragment] Multiple instances of Fragment detected. Running sketch(s) at simulated framerate.");
    }

    if (prev !== isSynchronized) {
        sync.set(isSynchronized);
    }
}

client.on('start', checkForSync);
client.on('client-connect', checkForSync);
client.on('client-disconnect', checkForSync);
