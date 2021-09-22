import { get } from "svelte/store";
import Trigger from "./Trigger";
import Mouse from "../inputs/Mouse";

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
    return (fn, { context } = {}) => {
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

            if (!collection.has(context)) {
                collection.set(context, []);
            }

            const trigger = new Trigger('Mouse', eventName, fn, { context }, () => {
                const items = collection.get(context);
                const index = items.findIndex((item) => item.id === trigger.id);

                collection.set(context, [...items].splice(index, 1));
            });

            collection.set(context, [...collection.get(context), trigger]);

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
