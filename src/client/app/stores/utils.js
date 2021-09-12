export const rehydrate = (key, defaultValue) => {
    const value = localStorage.getItem(key) || defaultValue;

    save(key, value);

    return typeof value === "string" ? JSON.parse(value) : value;
};

export const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const keepInSync = (key) => {
    return (value) => {
        save(key, value);
    };
};
