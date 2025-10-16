# Triggers

Mouse triggers are called when the event happens on the `<canvas>` used for your sketch.

## Mouse

### `onClick`
- Type: `(listener: (event:MouseEvent) => void) => void`

Register a `click` listener on the `<canvas>`.

```js
import { onClick } from '@fragment/triggers';

export let init = () => {
	onClick(() => {
		console.log(`canvas click`);
	});
}
```

### `onMouseDown`
- Type: `(listener: (event:MouseEvent) => void) => void`

Register a `mousedown` listener on the `<canvas>`.

```js
import { onMouseDown } from '@fragment/triggers';

export let init = () => {
	onMouseDown(() => {
		console.log(`canvas mouse down`);
	});
}
```

### `onMouseUp`
- Type: `(listener: (event:MouseEvent) => void) => void`

Register a `mouseup` listener on the `<canvas>`.

```js
import { onMouseUp } from '@fragment/triggers';

export let init = () => {
	onMouseUp((event) => {
		console.log(`canvas mouse up`, event);
	});
}
```

### `onMouseMove`
- Type: `(listener: (event:MouseEvent) => void) => void`

Register a `mousemove` listener on the `<canvas>`.

```js
import { onMouseMove } from '@fragment/triggers';

export let init = () => {
	onMouseMove((event) => {
		console.log(`canvas mouse move`, event);
	});
}
```

## Keyboard

Keyboard triggers are called when the event happens on `window`.
A `key` argument can be optionnaly passed to call the listener only when a specific key is typed. If a single function is provided, the listener will be called for every key typed. The `key` argument can also be an array, in this case it will be called for every key typed in the array.

> ⚠ The `key` argument is case sensitive, so `onKeyPress('a', () =>)` and `onKeyPress('A', () =>)` is not the same thing

### `onKeyPress`
- Type: `(key?: (string|string[]), listener: (event:KeyboardEvent) => void) => void`

Register a `keypress` listener for `key` on `window`.

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

### `onKeyDown`
- Type: `(key?: (string|string[]), listener: (event:KeyboardEvent) => void) => void`

Register a `keydown` listener for `key` on `window`.

```js
import { onKeyDown } from "@fragment/triggers";

export let init = () => {
	onKeyDown('a', () => {
		console.log("called when 'a' is down");
	});
};
```

### `onKeyUp`
- Type: `(key?: (string|string[]), listener: (event:KeyboardEvent) => void) => void`

Register a `keyup` listener for `key` on `window`.

```js
import { onKeyUp } from "@fragment/triggers";

export let init = () => {
	onKeyUp('a', () => {
		console.log("called when 'a' is up");
	});
};
```

## MIDI

MIDI triggers are called when using a MIDI device after authorizing usage of the [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API).

### `onNoteOn`
- Type: `(note?:(string|string[]), listener: (event:MIDIEvent) => void) => void`

Register a listener called when `note` is played on. Notes: `["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]`.

### `onNoteOff`
- Type: `(note?:(string|string[]), listener: (event:MIDIEvent) => void) => void`

Register a listener called when `note` is played off. Notes: `["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]`.

### `onNumberOn`
- Type: `(noteNumber?:(number|number[], listener: (event:MIDIEvent) => void) => void`

Register a listener called when `noteNumber` is played on.

### `onNumberOff`
- Type: `(noteNumber?:(number|number[], listener: (event:MIDIEvent) => void) => void`

Register a listener called when `noteNumber` is played off.

### `onControlChange`
- Type: `(control?:(number|number[]), listener: (event:MIDIEvent) => void) => void`

Register a listener called when `control` changes.
