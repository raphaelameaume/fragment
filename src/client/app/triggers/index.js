import { removeHotListeners as removeHotMouseListeners } from "./Mouse.js";
import { removeHotListeners as removeHotKeyboardListeners } from "./Keyboard.js";
import { removeHotListeners as removeHotMIDIListeners } from "./MIDI.js";

export * from "./Mouse.js";
export * from "./Keyboard.js";
export * from "./MIDI.js";

export const removeHotListeners = (key) => {
	removeHotMouseListeners(key);
	removeHotMIDIListeners(key);
	removeHotKeyboardListeners(key);
};
