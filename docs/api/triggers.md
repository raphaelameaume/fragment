#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → Triggers</sup>
<br>

# Triggers

Triggers are a set of functions you can call imperatively from your sketch file to make it *interactive*. They can also be triggered when a prop changes when setted up through the UI.

They are automatically cleanup on each reload.

Instead of setting up the listener manually:
```js
export let init = ({ canvas }) => {
	canvas.addEventListener('click', (event) => {
		console.log("canvas clicked");
	});
}
```

You can import and use them in your sketch:
```js
import { onClick } from "@fragment/triggers";

export let init = ({ canvas }) => {
	onClick((event) => {
		console.log("canvas clicked");
	});
}
```

## Mouse

Mouse triggers are called when the event happens on the `<canvas>` used for your sketch.

#### `onClick`
- Type: `(MouseEvent) => void`

#### `onMouseDown`
- Type: `(MouseEvent) => void`

#### `onMouseUp`
- Type: `(MouseEvent) => void`

#### `onMouseMove`
- Type: `(MouseEvent) => void`

## Keyboard

#### `onKeyPress`
- Type: `(KeyboardEvent) => void`

#### `onKeyDown`
- Type: `(KeyboardEvent) => void`

#### `onKeyDown`
- Type: `(KeyboardEvent) => void`

## MIDI

#### `onNoteOn`
- Type: `(MIDIEvent) => void`

#### `onNoteOff`
- Type: `(MIDIEvent) => void`

#### `onNumberOn`
- Type: `(MIDIEvent) => void`

#### `onNumberOff`
- Type: `(MIDIEvent) => void`

#### `onControlChange`
- Type: `(MIDIEvent) => void`
