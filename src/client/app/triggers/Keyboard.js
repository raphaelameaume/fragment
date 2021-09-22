import Trigger from "./Trigger";
import Keyboard from "../inputs/Keyboard";

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

        triggers.forEach(trigger => {
            if (!Keyboard.enabled) return;
            
            trigger.run(event);
        });
    };
}

function createTrigger(eventName, collection) {
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

        const trigger = new Trigger('Keyboard', eventName, fn, {...options, key }, () => {
            // dispose
        });

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

export const onKeyPress = createTrigger('onKeyPress', pressedKeys);
export const onKeyDown = createTrigger('onKeyDown', downKeys); 
export const onKeyUp = createTrigger('onKeyUp', upKeys);
