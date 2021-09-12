import { writable } from "svelte/store";
import { defaultLayouts } from "../data/LayoutData";
import { keepInSync, rehydrate } from "./utils";

const key = `layout.current`;

export const current = writable(rehydrate(key, defaultLayouts[0].data));

export const addRow = () => {
    current.update((current) => {
        const updated = {
            rows: [...current.rows, { grow: 1, cols: [] }]
        };

        return updated;
    })
}

current.subscribe(keepInSync(key));
