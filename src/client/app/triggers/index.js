import * as Mouse from "./Mouse.js";
import * as Keyboard from "./Keyboard.js";
import * as MIDI from "./MIDI.js";

export * from "./Mouse.js";
export * from "./Keyboard.js";
export * from "./MIDI.js";

export { Mouse, Keyboard, MIDI };

/**
 * Remove all listeners for all kinds of inputs for a specific context
 * @param {string} context 
 */
export const removeHotListeners = (context) => {
	Mouse.removeHotListeners(context);
	Keyboard.removeHotListeners(context);
	MIDI.removeHotListeners(context);
};
