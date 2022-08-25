import Trigger from "./Trigger";
import { wildcard, getContext } from "./shared.js";
import { addToMapArray, removeFromMapArray } from "../utils";

window.mouseIsPressed = false;
window.mouseX = 0;
window.mouseY = 0;

const downs = new Map();
const ups = new Map();
const moves = new Map();
const clicks = new Map();

export const reset = (context) => {
    downs.delete(context);
    ups.delete(context);
    moves.delete(context);
    clicks.delete(context);
}

export const removeHotListeners = (context) => {
    function removeHotFrom(collection) {
        const triggers = collection.get(context);

        if (triggers && triggers.length > 0) {
            const hotListeners = triggers.filter(t => t.hot);
            const rest = triggers.filter(t => !t.hot);

            hotListeners.forEach(t => t.destroy());

            collection.set(context, rest);
        }
    }

    removeHotFrom(downs);
    removeHotFrom(ups);
    removeHotFrom(moves);
    removeHotFrom(clicks);
};

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
                context = getContext();
            }

            const trigger = new Trigger({
                inputType: 'Mouse',
                eventName,
                fn,
                params: { context },
                context,
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
