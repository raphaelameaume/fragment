import { get } from "svelte/store";
import Trigger from "./Trigger";
import Mouse from "../inputs/Mouse";
import { addToMapArray, removeFromMapArray } from "../utils";

window.mouseIsPressed = false;
window.mouseX = 0;
window.mouseY = 0;

const wildcard = "*";

const downs = new Map();
const ups = new Map();
const moves = new Map();
const clicks = new Map();

export let sketchFiles = [];

export const reset = (key) => {
    downs.delete(key);
    ups.delete(key);
    moves.delete(key);
    clicks.delete(key);
}

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

    removeHotFrom(downs);
    removeHotFrom(ups);
    removeHotFrom(moves);
    removeHotFrom(clicks);
};

export const assignSketchFiles = (files) => {
    sketchFiles.push(...files);
}

const checkForTriggers = (collection, event, scope) => {

    const triggers = [
        ...(collection.has(scope) ? collection.get(scope) : []),
        ...(collection.has(wildcard) ? collection.get(wildcard) : []),
    ];

    triggers.forEach(trigger => {
        trigger.run(event)
    });
}

/**
 * 
 * @param {Map} collection 
 * @returns 
 */
const createTrigger = (eventName, collection) => {
    return (fn, { context, hot, enabled } = {}) => {
        try {
            if (!context) {
                const { stack } = new Error();
                const { url } = import.meta;

                const callstack = stack.split('\n');
                const index = callstack.findIndex((call) => call.includes(url));

                if (index >= 0) {
                    callstack.splice(0, index + 1);
                }

                for (let i = 0; i < callstack.length; i++) {
                    for (let j = 0; j < sketchFiles.length; j++) {
                        const sketchFile = sketchFiles[j];

                        if (callstack[i].includes(sketchFile)) {
                            context = sketchFile;
                            break;
                        }
                    }
                }

                if (!context) {
                    context = wildcard;
                }
            }

            const trigger = new Trigger({
                inputType: 'Mouse',
                eventName,
                fn,
                params: { context },
                hot,
                enabled,
                destroy: () => {
                    removeFromMapArray(collection, context, (item) => item.id === trigger.id);
                }
            });

            addToMapArray(collection, context, trigger);

            return trigger;
        } catch(error) {
            console.error(error);
            
            return null;
        }
    }
};

export const checkForTriggersDown = (event, context) => checkForTriggers(downs, event, context);
export const checkForTriggersMove = (event, context) => checkForTriggers(moves, event, context);
export const checkForTriggersUp = (event, context) => checkForTriggers(ups, event, context);
export const checkForTriggersClick = (event, context) => checkForTriggers(clicks, event, context);

export const onMouseDown = createTrigger('onMouseDown', downs);
export const onMouseUp = createTrigger('onMouseUp', ups);
export const onMouseMove = createTrigger('onMouseMove', moves);
export const onClick = createTrigger('onClick', clicks);
