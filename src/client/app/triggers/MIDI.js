import MIDI from "../inputs/MIDI.js";
import Trigger from "./Trigger";

const wildcard = "*";
const noteons = new Map();
const noteoffs = new Map();
const controlchanges = new Map();

function createEventListener(collection) {
    return (event) => {
        const { key, target } = event;

		const triggers = [
			...(collection.has(key) ? collection.get(key) : []),
			...(collection.has(wildcard) ? collection.get(wildcard) : []),
		];

		triggers.forEach(trigger => {
			if (!MIDI.enabled) return;
			
			trigger.run(event);
		});
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

        let keys = key.split('').includes(',') ? key.split(',') : [key];
        keys = keys.filter((k) => k !== '');
        
        const trigger = new Trigger('MIDI', eventName, fn, {...options, key }, () => {
            keys.forEach((k) => {
                removeFromMapArray(collection, k, (item) => item.id === trigger.id);
            });
        });

        keys.forEach(k => {
            addToMapArray(collection, k, trigger);
        });

        return trigger;
    };
};

MIDI.addEventListener("noteon", createEventListener(noteons));
MIDI.addEventListener("noteoff", createEventListener(noteoffs));
MIDI.addEventListener("controlchange", createEventListener(controlchanges));

export const onKeyPress = createTrigger('onNoteOn', noteons);
export const onKeyDown = createTrigger('onNoteOff', noteoffs); 
export const onKeyUp = createTrigger('onControlChange', controlchanges);
