import Trigger from './Trigger';
import MIDI from '../inputs/MIDI.js';
import { addToMapArray, removeFromMapArray } from '../utils';
import { wildcard, getContext } from './shared';

const noteons = new Map();
const noteoffs = new Map();
const numberons = new Map();
const numberoffs = new Map();
const controlchanges = new Map();

/**
 * Remove listeners from a specific context
 * @param {string} context
 */
export const removeHotListeners = (context) => {
	function removeHotFrom(collection) {
		for (let trigger of collection) {
			const [key, triggers] = trigger;

			collection.set(
				key,
				triggers.filter((trigger) => trigger.context !== context),
			);
		}
	}

	removeHotFrom(noteons);
	removeHotFrom(noteoffs);
	removeHotFrom(numberons);
	removeHotFrom(numberoffs);
	removeHotFrom(controlchanges);
};

/**
 * Check all registered listeners for a specific key
 * @param {Map} collection
 * @param {function} getKey
 * @returns {function} listener
 */
function createEventListener(collection, getKey = (event) => event.key) {
	return (event) => {
		const key = getKey(event);
		const { id } = event.srcElement;

		const triggers = [
			...(collection.has(key) ? collection.get(key) : []),
			...(collection.has(wildcard) ? collection.get(wildcard) : []),
		];

		if (MIDI.enabled && id === MIDI.selectedInputID) {
			triggers.forEach((trigger) => {
				trigger.run(event);
			});
		}
	};
}

/**
 * Create a registering function for a specific event
 * @param {string} eventName
 * @param {Map} collection
 * @returns {function} createListener
 */
function createTrigger(eventName, collection) {
	return (key, fn, options = {}) => {
		if (typeof key === 'function') {
			if (typeof fn === 'object') {
				options = {
					...options,
					...fn,
				};
			}

			fn = key;
			key = '*';

			if (options.key) {
				key = options.key;
			}
		}

		const { hot, enabled, ...params } = options;
		let keys = Array.isArray(key)
			? key
			: [...`${key}`.split(',').map((k) => k.trim())];

		if (
			['onControlChange', 'onNumberOn', 'onNumberOff'].includes(eventName)
		) {
			keys = keys.map((k) => (!isNaN(Number(k)) ? Number(k) : k));
		}

		if (!MIDI.enabled) {
			MIDI.request();
		}

		const context = getContext();

		const trigger = new Trigger({
			inputType: 'MIDI',
			eventName,
			fn,
			params: { ...params, key: keys },
			hot,
			context,
			enabled,
			destroy: () => {
				keys.forEach((key) => {
					removeFromMapArray(
						collection,
						key,
						(item) => item.id === trigger.id,
					);
				});
			},
		});

		keys.forEach((k) => {
			addToMapArray(collection, k, trigger);
		});

		return trigger;
	};
}

MIDI.addEventListener(
	'noteon',
	createEventListener(noteons, (event) => event.note.name),
);
MIDI.addEventListener(
	'noteoff',
	createEventListener(noteoffs, (event) => event.note.name),
);
MIDI.addEventListener(
	'noteon',
	createEventListener(numberons, (event) => event.note.number),
);
MIDI.addEventListener(
	'noteoff',
	createEventListener(numberoffs, (event) => event.note.number),
);
MIDI.addEventListener(
	'controlchange',
	createEventListener(controlchanges, (event) => event.note.number),
);

export const onNoteOn = createTrigger('onNoteOn', noteons);
export const onNoteOff = createTrigger('onNoteOff', noteoffs);
export const onNumberOn = createTrigger('onNumberOn', numberons);
export const onNumberOff = createTrigger('onNumberOff', numberoffs);
export const onControlChange = createTrigger('onControlChange', controlchanges);
