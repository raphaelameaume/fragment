import { writable, get } from "svelte/store";
import { sketchesCount } from "@fragment/props";
import { defaultLayouts } from "../data/LayoutData";
import { keepInSync, rehydrate } from "./utils";

const isMany = sketchesCount > 1;
const key = `fragment.layout.current.${isMany ? 'multiple' : 'single'}`;

export const outputLayout = defaultLayouts.find((layout) => layout.name === "Output");
export const singleLayout = defaultLayouts.find((layout) => layout.name === "Single");
export const defaultLayout = defaultLayouts.find((layout) => layout.name === "Sketching");


if (__PRODUCTION__) {
    defaultLayout = singleLayout;
}

let override = !window.location.search.includes('?output');
override = __PRODUCTION__ ? false : true;

if (window.location.search.includes('?output')) {
    defaultLayout = outputLayout;
}

export const current = writable({
    ...rehydrate(key, defaultLayout, override),
    editable: false,
    resizable: false,
});

keepInSync(key, current);

export const addRow = () => {
    current.update((current) => {
        return {
            ...current,
            rows: [
                ...current.rows,
                { flex: 1, cols: [] }
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
                            flex: 1,
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

export const traverse = (fn) => {
    const { rows } = get(current);

    rows.forEach(({ cols, modules = [] }) => {
        modules.forEach(fn);

        cols.forEach(({ modules = []}) => {
            modules.forEach(fn);
        })
    });
}
