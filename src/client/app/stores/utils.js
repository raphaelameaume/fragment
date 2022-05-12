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

    // window.addEventListener('storage', (event) => {
    //     if (event.key === key) {
    //         store.set(JSON.parse(event.newValue));
    //     }
    // })
};


let persistentStores = new Map();

export const getPersistentStore = (key, reset = false) => {
    if (!persistentStores.has(key)) {
        let store = writable(
            rehydrate(key, { props: {} }, reset),
        );
        keepInSync(key, store);

        persistentStores.set(key, store); 
    }

    return persistentStores.get(key);
};
