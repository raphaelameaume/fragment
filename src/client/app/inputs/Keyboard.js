import Trigger from "../core/Trigger";

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
        
        triggers.forEach(trigger => trigger.run());
    };
}

function createTrigger(collection) {
    const defaultOptions = {
        caseSensitive: true,
    };

    return (key, fn, options = defaultOptions) => {
        if (typeof key === "function") {
            fn = key;
            key = "*";
        }

        if (typeof fn === "object") {
            options = {
                ...defaultOptions,
                ...fn,
            };
        }

        let keys = options.caseSensitive ? [key] : [key.toLowerCase(), key.toUpperCase()];

        const trigger = new Trigger(fn, {...options, key});

        keys.forEach(k => {
            if (collection.has(k)) {
                collection.set(k, [...collection.get(k), trigger]);
            } else {
                collection.set(k, [trigger]);
            }
        });

        return trigger;
    };
};

window.addEventListener("keypress", createEventListener(pressedKeys));
window.addEventListener("keyup", createEventListener(upKeys));
window.addEventListener("keydown", createEventListener(downKeys));

export const onKeyPress = createTrigger(pressedKeys);
export const onKeyDown = createTrigger(downKeys); 
export const onKeyUp = createTrigger(upKeys);

onKeyUp("m", () => {

});

onKeyUp("m", { caseSensitive: false });
