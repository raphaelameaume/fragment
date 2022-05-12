import Trigger from "./Trigger";
import MIDI from "../inputs/MIDI.js";
import { addToMapArray, removeFromMapArray } from "../utils";

const wildcard = "*";
const noteons = new Map();
const noteoffs = new Map();
const numberons = new Map();
const numberoffs = new Map();
const controlchanges = new Map();

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

    removeHotFrom(noteons);
    removeHotFrom(noteoffs);
    removeHotFrom(numberons);
    removeHotFrom(numberoffs);
    removeHotFrom(controlchanges);
};

function createEventListener(collection, getKey = (event) => event.key) {
    return (event) => {
        const key = getKey(event);
		const { id } = event.srcElement;

		const triggers = [
			...(collection.has(key) ? collection.get(key) : []),
			...(collection.has(wildcard) ? collection.get(wildcard) : []),
		];

		if (MIDI.enabled && id === MIDI.selectedInputID) {
			triggers.forEach(trigger => {
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
            inputType: 'MIDI',
            eventName,
            fn,
            params: {...params, key: keys },
            hot,
            enabled,
            destroy : () => {
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

MIDI.addEventListener("noteon", createEventListener(noteons, (event) => event.note.name));
MIDI.addEventListener("noteoff", createEventListener(noteoffs, (event) => event.note.name));
MIDI.addEventListener("noteon", createEventListener(numberons, (event) => String(event.note.number)));
MIDI.addEventListener("noteoff", createEventListener(numberoffs, (event) => String(event.note.number)));
MIDI.addEventListener("controlchange", createEventListener(controlchanges, (event) => String(event.note.number)));

export const onNoteOn = createTrigger('onNoteOn', noteons);
export const onNoteOff = createTrigger('onNoteOff', noteoffs);
export const onNumberOn = createTrigger('onNumberOn', numberons);
export const onNumberOff = createTrigger('onNumberOff', numberoffs);
export const onControlChange = createTrigger('onControlChange', controlchanges);
