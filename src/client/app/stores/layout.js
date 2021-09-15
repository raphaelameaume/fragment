import { writable } from "svelte/store";
import { defaultLayouts } from "../data/LayoutData";
import { keepInSync, rehydrate } from "./utils";

const key = `layout.current`;

export const current = writable({
    ...rehydrate(key, defaultLayouts[0].data, true),
    editable: false,
});

export const addRow = () => {
    current.update((current) => {
        return {
            ...current,
            rows: [
                ...current.rows,
                { grow: 1, cols: [] }
            ]
        };
    });
}

export const deleteRow = (index) => {
    current.update((current) => {
        const updated = {
            ...current,
            rows: current.rows.filter((row, rowIndex) => rowIndex !== index)
        };

        return updated;
    });
}

export const addColumn = (index) => {
    current.update((current) => {
        const updated = {
            ...current,
            rows: current.rows.map((row, rowIndex) => {
                return index === rowIndex ? {
                    ...row,
                    cols: [
                        ...row.cols,
                        {
                            grow: 1,
                            modules: []
                        }
                    ]
                } : row;
            })
        }

        return updated;
    });
}

export const changeRowIndex = (fromIndex, toIndex) => {
    current.update((current) => {
        const row = current.rows[fromIndex];
        const rows = [...current.rows];

        rows.splice(fromIndex, 1);
        rows.splice(toIndex, 0, row);

        return {
            ...current,
            rows,
        };
    });
}

export const edit = () => {
    current.update((curr) => {
        return {
            ...curr,
            editable: !curr.editable,
        };
    })
}

current.subscribe(keepInSync(key));
