import Trigger from "./Trigger";
import Keyboard from "../inputs/Keyboard";
import { addToMapArray, removeFromMapArray } from "../utils";

const wildcard = "*";
const pressedKeys = new Map();
const upKeys = new Map();
const downKeys = new Map();

export const removeHotListeners = (key) => {
    function removeHotFrom(collection) {
        const triggers = collection.get(key);

        if (triggers && triggers.length > 0) {
            const hotListeners = triggers.filter(t => t.hot);
            const rest = triggers.filter(t => !t.hot);

            hotListeners.forEach(t => t.destroy());

            collection.set(key, rest);
        }
    }

    removeHotFrom(pressedKeys);
    removeHotFrom(upKeys);
    removeHotFrom(downKeys);
};

function createEventListener(collection) {
    return (event) => {
        const { key, target } = event;

        if (!target.classList.contains('input')) {
            const triggers = [
                ...(collection.has(key) ? collection.get(key) : []),
                ...(collection.has(wildcard) ? collection.get(wildcard) : []),
            ];

            triggers.forEach(trigger => {
                if (!Keyboard.enabled) return;
                
                trigger.run(event);
            });
        }
    };
}

function createTrigger(eventName, collection) {
    return (key, fn, options = {}) => {
        if (typeof key === "function") {
            if (typeof fn === "object") {
                options = {
                    ...options,
                    ...fn,
                };
            }

            fn = key;
            key = "*";

            if (typeof options.key === 'string') {
                key = options.key;
            }
        }

        const { hot, enabled, ...params } = options;

        let keys = key.split('').includes(',') ? key.split(',') : [key];
        keys = keys.filter((k) => k !== '');
        
        const trigger = new Trigger({
            inputType: 'Keyboard',
            eventName,
            fn,
            params: {...params, key },
            hot,
            enabled,
            destroy: () => {
                keys.forEach((k) => {
                    removeFromMapArray(collection, k, (item) => item.id === trigger.id);
                });
            }
        });

        keys.forEach(k => {
            addToMapArray(collection, k, trigger);
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
