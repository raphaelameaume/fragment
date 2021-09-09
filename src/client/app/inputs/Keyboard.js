const wildcard = "*";
const pressedKeys = new Map();
const upKeys = new Map();
const downKeys = new Map();

function createEventListener(collection) {
    return (event) => {
        const { key } = event;

        const triggers = [
            ...(collection.has(key) ? collection.get(key) : []),
            ...(collection.has(wildcard) ? collection.get(wildcard) : []),
        ];
        
        triggers.forEach(trigger => trigger());
    };
}

function createTrigger(collection) {
    return (key, fn, { caseSensitive = true } = {}) => {
        if (typeof key === "function") {
            fn = key;
            key = "*";
        }

        let keys = caseSensitive ? [key] : [key.toLowerCase(), key.toUpperCase()];

        keys.forEach(k => {
            if (collection.has(k)) {
                collection.set(k, [...collection.get(k), fn]);
            } else {
                collection.set(k, [fn]);
            }
        })
    };
};

window.addEventListener("keypress", createEventListener(pressedKeys));
window.addEventListener("keyup", createEventListener(upKeys));
window.addEventListener("keydown", createEventListener(downKeys));

export const onKeyPress = createTrigger(pressedKeys);
export const onKeyDown = createTrigger(downKeys); 
export const onKeyUp = createTrigger(upKeys);
