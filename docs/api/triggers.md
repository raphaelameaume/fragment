# Triggers

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
- Type: (note?: Note | Note[], listener: (event: MIDIEvent) => void) => void
- Where `Note` = `"C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B"`

Registers a listener triggered on a MIDI `noteon` event for the specified note or notes (fired when the key is pressed down).

```js
import { onNoteOn } from "@fragment/triggers";

export let init = () => {
	onNoteOn('C', () => {
		console.log("C pressed");
	});
};
```

### `onNoteOff`
- Type: (note?: Note | Note[], listener: (event: MIDIEvent) => void) => void
- Where `Note` = `"C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B"`

Registers a listener triggered on a MIDI `noteoff` event for the specified note or notes (fired when the key is released).

```js
import { onNoteOff } from "@fragment/triggers";

export let init = () => {
	onNoteOff(['D', "D#"], () => {
		console.log("D or D# released");
	});
};
```

### `onNumberOn`
- Type: `(noteNumber?: number | number[], listener: (event: MIDIEvent) => void) => void`

Registers a listener triggered on a MIDI `noteon` event for the specified note number or numbers (fired when the key is pressed down).

```js
import { onNumberOn } from "@fragment/triggers";

export let init = () => {
  onNumberOn([60, 62], () => {
    console.log("Note numbers 60 or 62 pressed down");
  });
};
```

### `onNumberOff`
- Type: `(noteNumber?: number | number[], listener: (event: MIDIEvent) => void) => void`

Registers a listener triggered on a MIDI `noteoff` event for the specified note number or numbers (fired when the key is released).

```js
import { onNumberOff } from "@fragment/triggers";

export let init = () => {
  onNumberOff([60, 62], () => {
    console.log("Note numbers 60 or 62 released");
  });
};
```

### `onControlChange`
- Type: `(control?: number | number[], listener: (event: MIDIEvent) => void) => void`

Registers a listener triggered on a MIDI `controlchange` event for the specified controls.

```js
import { onControlChange } from "@fragment/triggers";

export let init = () => {
  onControlChange([1, 7], (event) => {
    console.log("Control 1 or 7 changed", event.value);
  });
};
```
