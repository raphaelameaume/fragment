import { writable } from "svelte/store";

const savedLayouts = [];
const defaultsLayouts = [
    {
        name: "VJ",
        data: {
            rows: [
                {
                    grow: 1,
                    cols: [
                        { grow: 1 },
                        { grow: 1 },
                        { grow: 1 },
                    ]
                },
                {
                    grow: 1,
                    cols: [
                        { grow: 1 },
                        { grow: 1 },
                    ]
                },
                {
                    grow: 1,
                    cols: [
                        { grow: 1 },
                    ]
                }
            ]
        }
    }
];

export const current = writable(defaultsLayouts[0].data);

current.subscribe((value) => {
    console.log("Layout has changed.");
});
