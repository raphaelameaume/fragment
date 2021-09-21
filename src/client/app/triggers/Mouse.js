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
const createTrigger = (collection) => {
    return (fn, { scope = wildcard } = {}) => {
        const trigger = new Trigger(fn, { scope });

        try {
            const { stack } = new Error();
            const { url } = import.meta;

            const callstack = stack.split('\n');
            const index = callstack.findIndex((call) => call.includes(url));

            if (index >= 0) {
                callstack.splice(0, index + 1);
            }

            let scope = wildcard;

            for (let i = 0; i < callstack.length; i++) {
                for (let j = 0; j < sketchFiles.length; j++) {
                    const sketchFile = sketchFiles[j];

                    if (callstack[i].includes(sketchFile)) {
                        scope = sketchFile;
                        break;
                    }
                }
            }

            if (!collection.has(scope)) {
                collection.set(scope, []);
            }

            collection.set(scope, [...collection.get(scope), trigger]);

            console.log(collection);
        } catch(error) {
            console.error(error);
        }

        return trigger;
    }
};

export const checkForTriggersDown = (event, scope) => checkForTriggers(downs, event, scope);
export const checkForTriggersMove = (event, scope) => checkForTriggers(moves, event, scope);
export const checkForTriggersUp = (event, scope) => checkForTriggers(ups, event, scope);
export const checkForTriggersClick = (event, scope) => checkForTriggers(clicks, event, scope);

export const onMouseDown = createTrigger(downs);
export const onMouseUp = createTrigger(ups);
export const onMouseMove = createTrigger(moves);
export const onClick = createTrigger(clicks);
