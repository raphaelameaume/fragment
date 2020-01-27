
const STORAGE_TYPE_LOCAL = 'localStorage';

const Storage = function Storage() {
    function set(key, value) {
        // wrap in try/catch because Safari in private mode cause js error when trying to access localStorage
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            console.warn(error);
        }

        return () => {
            unset(key);
        };
    }

    function get(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            console.warn(error);
        }
    }

    function unset(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.warn(error);
        }
    }

    function rehydrate(key, fn) {
        if (key.length > 0 && get(key)) {
            let parsed = JSON.parse(get(key));
            
            if (fn && typeof fn === 'function') {
                fn(parsed);
            }
        }
    }

    return {
        set,
        get,
        unset,
        rehydrate,
    };
}();

export { Storage };