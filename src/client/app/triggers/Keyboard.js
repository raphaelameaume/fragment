import Trigger from "./Trigger";
import Keyboard from "../inputs/Keyboard";
import { wildcard, getContext } from "./shared";
import { addToMapArray, removeFromMapArray } from "../utils";

const pressedKeys = new Map();
const upKeys = new Map();
const downKeys = new Map();

export const removeHotListeners = (context) => {
    function removeHotFrom(collection) {
        for (let trigger of collection) {
            const [key, triggers] = trigger;
            
            collection.set(key, triggers.filter((trigger) => trigger.context !== context));
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

            if (options.key) {
                key = options.key;
            }
        }

        const { hot, enabled, ...params } = options;
        const context = getContext();

        const keys = Array.isArray(key) ? key : [key];
        
        const trigger = new Trigger({
            inputType: 'Keyboard',
            eventName,
            fn,
            context,
            params: {...params, key: keys },
            hot,
            enabled,
            destroy: () => {
                keys.forEach((key) => {
                    removeFromMapArray(collection, key, (item) => item.id === trigger.id);
                });
            }
        });

        keys.forEach(key => {
            addToMapArray(collection, key, trigger);
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
