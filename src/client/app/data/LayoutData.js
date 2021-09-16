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
                            grow: 1.36,
                            modules: [
                                { name: "monitor", grow: 1 },
                            ]
                        }, {
                            grow: 0.82,
                            modules: [
                                { name: "params" },
                            ]
                        }, {
                            grow: 0.82,
                            modules: [
                                { name: "params" },
                            ]
                        }
                    ]
                },
                {
                    grow: 0.5,
                    cols: [
                        {
                            grow: 1,
                            modules: [
                                { name: "mouse" },
                            ]
                        }, {
                            grow: 1,
                            modules: [
                                { name: "midi" },
                                { name: "keyboard" },
                            ]
                        },
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
