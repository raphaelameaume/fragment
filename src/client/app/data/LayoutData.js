export const savedLayouts = [];
export const defaultLayouts = [
    {
        name: "VJing",
        isMany: true,
        data: {
            rows: [
                {
                    flex: 1,
                    cols: [
                        {
                            flex: 1,
                            modules: [
                                { name: "monitor", flex: 1 },
                                { name: "params", flex: 1 },
                            ]
                        }, {
                            flex: 1,
                            modules: [
                                { name: "monitor", flex: 1 },
                                { name: "params", flex: 1 },
                            ]
                        }, {
                            flex: 1,
                            modules: [
                                { name: "monitor", flex: 1 },
                                { name: "params", flex: 1 },
                            ]
                        }
                    ]
                },
            ]
        }
    },
    {
        name: "Sketching",
        isMany: false,
        data: {
            rows: [
                {
                    flex: 1,
                    cols: [
                        {
                            flex: 1.4,
                            modules: [
                                { name: "monitor", flex: 1, grow: true },
                            ]
                        },
                        { 
                            flex: 0.6,
                            modules: [
                                { name: "params", flex: 1 },
                                { name: "params", flex: 1 },
                            ]
                        },
                    ]
                },
            ]
        }
    }
];
