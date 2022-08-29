#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → Triggers</sup>
<br>

# Triggers

## Mouse

Mouse triggers are called when the event happens on the `<canvas>` used for your sketch.

#### `onClick`
- Type: `(listener(event:MouseEvent): function) => void`

Register a `click` listener on the `<canvas>`.

#### `onMouseDown`
- Type: `(listener(event:MouseEvent): function) => void`

Register a `mousedown` listener on the `<canvas>`.

#### `onMouseUp`
- Type: `(listener(event:MouseEvent): function) => void`

Register a `mouseup` listener on the `<canvas>`.

#### `onMouseMove`
- Type: `(listener(event:MouseEvent): function) => void`

Register a `mousemove` listener on the `<canvas>`.

## Keyboard

Keyboard triggers are called when the event happens on `window`.
A `key` argument can be optionnaly passed to call the listener only when a specific key is typed. If a single function is provided, the listener will be called for every key typed. The `key` argument can also be an array, in this case it will be called for every key typed in the array.

> ⚠ The `key` argument is case sensitive, so `onKeyPress('a', () =>)` and `onKeyPress('A', () =>)` is not the same thing

```js
import { onKeyPress } from "@fragment/triggers";

export let init = () => {
	onKeyPress(() => {
		console.log("called for every keypress");
	});

	onKeyPress('a', () => {
		console.log("called when 'a' is pressed");
	});

	onKeyPress('A', () => {
		console.log("called when 'A' is pressed");
	});

	onKeyPress(['a', 'A'], () => {
		console.log("called when 'a' or 'A' is pressed");
	});
};
```

#### `onKeyPress`
- Type: `(key?: (string|string[]), listener(event:KeyboardEvent): function) => void`

Register a `keypress` listener for `key` on `window`.

#### `onKeyDown`
- Type: `(key?: (string|string[]), listener(event:KeyboardEvent): function) => void`

Register a `keydown` listener for `key` on `window`.

#### `onKeyUp`
- Type: `(key?: (string|string[]), listener(event:KeyboardEvent): function) => void`

Register a `keyup` listener for `key` on `window`.

## MIDI

MIDI triggers are called when using a MIDI device after authorizing usage of the [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API). 

#### `onNoteOn`
- Type: `(note?:(string|string[]), listener(event:MIDIEvent): function) => void`

Register a listener called when `note` is played on. Notes: `["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]`.

#### `onNoteOff`
- Type: `(note?:(string|string[]), listener(event:MIDIEvent): function) => void`

Register a listener called when `note` is played off. Notes: `["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]`.

#### `onNumberOn`
- Type: `(noteNumber?:(number|number[], listener(event:MIDIEvent): function) => void`

Register a listener called when `noteNumber` is played on.

#### `onNumberOff`
- Type: `(noteNumber?:(number|number[], listener(event:MIDIEvent): function) => void`

Register a listener called when `noteNumber` is played off.

#### `onControlChange`
- Type: `(control?:(number|number[]), listener(event:MIDIEvent): function) => void`

Register a listener called when `control` changes.
