export const savedLayouts = [];
export const defaultLayouts = [
    {
        name: "Single",
        data: {
            rows: [
                {
                    grow: 1,
                    cols: [
                        {
                            grow: 2,
                            modules: [
                                { name: "output-monitor", grow: 1 },
                            ]
                        }, {
                            grow: 1,
                            modules: [
                                { name: "output-params" },
                                { name: "stage-selector" },
                                { name: "stage-params" },
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "VJ",
        data: {
            rows: [
                {
                    grow: 1.3,
                    cols: [
                        {
                            grow: 1,
                            modules: [
                                {
                                    name: "monitor",
                                    grow: 0,
                                    params: {},
                                },
                                { 
                                    name: "stage-selector",
                                    grow: 0,
                                }
                            ]
                        },
                        { 
                            grow: 1,
                            modules: [
                                {
                                    name: "monitor",
                                    grow: 0,
                                    params: {},
                                },
                                { 
                                    name: "stage-selector",
                                    grow: 0,
                                }
                            ]
                        },
                        {
                            grow: 1,
                            modules: [
                                {
                                    name: "output-monitor",
                                    grow: 0,
                                    params: {},
                                }
                            ]
                        },
                    ]
                },
                {
                    grow: 0.7,
                    cols: [
                        { grow: 1 },
                        {
                            grow: 1,
                            modules: [
                                
                            ]
                        },
                    ]
                },
            ]
        }
    }
];
