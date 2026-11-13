import Trigger from '../triggers/Trigger';
import { Input } from './Input';

/**
 * @typedef {'noteoff' | 'noteon' | 'controlchange'} MIDIMessageType
 */

/**
 * @typedef {Object} MIDINote
 * @property {number} number MIDI note number (0–127). For control change messages this is the controller number.
 * @property {string} name Pitch class name, e.g. `"C#"`.
 * @property {number} octave Octave using the convention where note 60 is C4.
 */

/**
 * @typedef {Object} MIDIMessageData
 * @property {MIDIMessageType} type Message type.
 * @property {MIDINote} note Note (or controller) information derived from the first data byte.
 * @property {number} channel MIDI channel, 1–16.
 * @property {number} velocity Second data byte normalized to 0–1.
 * @property {number} rawVelocity Second data byte, 0–127.
 * @property {number} value Alias of `velocity`, convenient for control change messages.
 * @property {number} rawValue Alias of `rawVelocity`.
 * @property {MIDIInput | null} currentTarget The input port that produced the message.
 * @property {MIDIInput | null} target The input port that produced the message.
 * @property {MIDIInput | null} srcElement The input port that produced the message.
 */

/**
 * @callback MIDIListener
 * @param {*} data Event payload: {@link MIDIMessageData} for message events,
 * a `MIDIConnectionEvent` for port state events (`"connected"` / `"disconnected"`).
 * @returns {void}
 */

/**
 * Channel voice message types, keyed by the high nibble of the status byte.
 * @type {Readonly<Record<number, MIDIMessageType>>}
 */
const commands = {
	0x8: 'noteoff',
	0x9: 'noteon',
	0xb: 'controlchange',
};

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const LOCAL_STORAGE_KEY = 'fragment.midi.requested';

/**
 * @param {string} key
 * @returns {string | null}
 */
function readStorage(key) {
	try {
		return window.localStorage?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

/**
 * @param {string} key
 * @param {string | null} value
 * @returns {void}
 */
function writeStorage(key, value) {
	try {
		if (value === null) {
			window.localStorage?.removeItem(key);
		} else {
			window.localStorage?.setItem(key, value);
		}
	} catch {
		// fails silently if localStorage is not available
	}
}

class MIDI extends Input {
	static get isSupported() {
		return (
			typeof navigator !== 'undefined' &&
			typeof navigator.requestMIDIAccess === 'function'
		);
	}

	constructor() {
		super({
			name: 'MIDI',
		});

		/** @type {MIDIAccess | null} */
		this.access = null;

		/** @type {Promise<MIDIAccess|null> | null} */
		this.pendingAccess = null;

		/** @type {boolean} */
		this.enabled = false;

		/** @type {Map<string, MIDIListener[]>} */
		this.listeners = new Map();

		/** @type {string | null} */
		this.selectedInputID = null;

		/** @type {string | null} */
		this.selectedOutputID = null;

		if (readStorage(LOCAL_STORAGE_KEY) === 'true') {
			this.request();
		}
	}
	/**
	 *
	 * @param {Trigger} trigger
	 */
	add(trigger) {
		super.add(trigger);

		if (!this.enabled) {
			this.request();
		}
	}

	/** @returns {ReadonlyMap<string, MIDIInput>} */
	get inputs() {
		return this.access ? this.access.inputs : new Map();
	}

	/** @returns {ReadonlyMap<string, MIDIOutput>} */
	get outputs() {
		return this.access ? this.access.outputs : new Map();
	}

	start() {
		if (this.access) {
			this.access.onstatechange = (event) => this.onStateChange(event);
		}

		this.attachListeners();
		this.autoSelect();
	}

	autoSelect() {
		if (this.selectedInputID === null && this.inputs.size === 1) {
			const [entry] = this.inputs.values();
			this.selectedInputID = entry.id;
		}

		if (this.selectedOutputID === null && this.outputs.size === 1) {
			const [entry] = this.outputs.values();
			this.selectedOutputID = entry.id;
		}
	}

	attachListeners() {
		this.inputs.forEach((entry) => {
			entry.onmidimessage = (event) => this.onMessage(event);
		});
	}

	/**
	 * Registers a listener for an event.
	 *
	 * @param {string} eventName Event to listen to (see class description).
	 * @param {MIDIListener} fn Listener to call.
	 * @returns {() => void} Function that removes the listener.
	 */
	addEventListener(eventName, fn) {
		const current = this.listeners.get(eventName) ?? [];

		this.listeners.set(eventName, [...current, fn]);

		return () => this.removeEventListener(eventName, fn);
	}

	/**
	 * Removes a previously registered listener.
	 *
	 * @param {string} eventName Event the listener was registered for.
	 * @param {MIDIListener} fn Listener to remove.
	 * @returns {void}
	 */
	removeEventListener(eventName, fn) {
		const current = this.listeners.get(eventName);

		if (!current) {
			return;
		}

		const next = current.filter((listener) => listener !== fn);

		if (next.length > 0) {
			this.listeners.set(eventName, next);
		} else {
			this.listeners.delete(eventName);
		}
	}

	/**
	 * Parses a raw MIDI message and emits `"message"` plus a typed event.
	 * System messages (clock, active sensing, sysex…) and unsupported
	 * channel messages are ignored.
	 *
	 * @param {MIDIMessageEvent} event
	 * @returns {void}
	 */
	onMessage(event) {
		const { data } = event;
		const target = /** @type {MIDIInput | null} */ (event.target);

		if (!data || data.length === 0) {
			return;
		}

		const status = data[0];

		if (status >= 0xf0) {
			return;
		}

		let command = status >> 4;
		let type = commands[command];

		if (!type) {
			return;
		}

		const channel = (status & 0xf) + 1;
		const data1 = data[1] ?? 0;
		const data2 = data[2] ?? 0;

		if (type === 'noteon' && data2 === 0) {
			type = 'noteoff';
		}

		/** @type {MIDINote} */
		const note = {
			number: data1,
			name: notes[data1 % 12],
			octave: Math.floor(data1 / 12) - 1,
		};

		const velocity = data2 / 127;

		/** @type {MIDIMessageData} */
		const payload = {
			type,
			note,
			channel,
			velocity,
			rawVelocity: data2,
			value: velocity,
			rawValue: data2,
			currentTarget: target,
			target: target,
			srcElement: target,
		};

		this.emit('message', payload);
		this.emit(type, payload);

		if (type === 'noteon' || type === 'noteoff') {
			const suffix = type === 'noteon' ? 'On' : 'Off';

			this.runTriggers(payload, {
				eventName: `onNote${suffix}`,
				params: {
					key: [`${payload.note.name}`],
				},
			});

			this.runTriggers(payload, {
				eventName: `onNumber${suffix}`,
				params: {
					key: [`${payload.note.number}`],
				},
			});
		} else if (type === 'controlchange') {
			this.runTriggers(payload, {
				eventName: `onControlChange`,
				params: {
					key: [`${payload.note.number}`],
				},
			});
		}
	}

	/**
	 * Handles ports being connected or disconnected: keeps the selection
	 * consistent, re-attaches message handlers and emits the port state.
	 *
	 * @param {MIDIConnectionEvent} event
	 * @returns {void}
	 */
	onStateChange(event) {
		const { port } = event;

		if (port) {
			if (port.state === 'disconnected') {
				if (port.id === this.selectedInputID) {
					this.selectedInputID = null;
				}

				if (port.id === this.selectedOutputID) {
					this.selectedOutputID = null;
				}
			}

			this.emit(port.state, event);
		}

		this.attachListeners();
		this.autoSelect();
	}

	/**
	 * @param {string} eventName
	 * @param {*} data
	 * @returns {void}
	 */
	emit(eventName, data) {
		const listeners = this.listeners.get(eventName);

		if (!listeners) {
			return;
		}

		listeners.forEach((listener) => {
			try {
				listener(data);
			} catch (error) {
				console.error(error);
			}
		});
	}

	/**
	 * Requests MIDI access from the browser. Concurrent calls share the same
	 * pending request, and calls after access is granted resolve immediately.
	 * The grant is remembered so access is re-requested on the next load;
	 * a refusal clears that flag so the user isn't prompted again on every load.
	 *
	 * @returns {Promise<MIDIAccess | null>} The access object, or `null` if
	 * the request failed or the API is unsupported.
	 */
	async request() {
		if (this.access) {
			return this.access;
		}

		if (this.pendingAccess) {
			return this.pendingAccess;
		}

		if (!MIDI.isSupported) {
			writeStorage(LOCAL_STORAGE_KEY, null);
			console.error(
				new Error(
					'The Web MIDI API is not supported in this environment.',
				),
			);
			return null;
		}

		this.pendingAccess = navigator
			.requestMIDIAccess()
			.then((access) => {
				this.access = access;
				this.enabled = true;
				writeStorage(LOCAL_STORAGE_KEY, 'true');
				this.start();

				return access;
			})
			.catch((error) => {
				writeStorage(LOCAL_STORAGE_KEY, null);
				console.error(error);

				return null;
			})
			.finally(() => {
				this.pendingAccess = null;
			});

		return this.pendingAccess;
	}
}

export default new MIDI();
