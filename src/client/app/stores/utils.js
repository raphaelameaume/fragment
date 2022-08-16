import { writable } from "svelte/store";

/**
 * 
 * @param {string} key 
 * @param {any} defaultValue 
 * @param {boolean} override 
 * @returns {any} result
 */
export const rehydrate = (key, defaultValue, override = false) => {
    const storedValue = localStorage.getItem(key);
    const value = (storedValue && !override) ? JSON.parse(storedValue) : defaultValue;

    try {
        const result = typeof value === "string" ? JSON.parse(value) : value;
        return result;
    } catch(error) {
        return defaultValue;
    }
};

/**
 * 
 * @param {string} key 
 * @param {any} value 
 */
export const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

/**
 * 
 * @param {string} key 
 * @returns {void}
 */
export const keepInSync = (key, store) => {
    store.subscribe((value) => {
        save(key, value);
    });
};


let persistentStores = new Map();

export const createPersistentStore = (key, reset = false, initialValue) => {
    let store = writable(
        rehydrate(key, initialValue, reset),
    );
    keepInSync(key, store);

    persistentStores.set(key, store);

    return store;
};

export const getPersistentStore = (key, reset = false, initialValue) => {
    if (!persistentStores.has(key)) {
        return createPersistentStore(key, reset, initialValue);
    }

    return persistentStores.get(key);
};
