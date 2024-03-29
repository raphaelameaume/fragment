#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Using triggers</sup>

# Using triggers

Triggers are functions you can call imperatively from your sketch file to make it *interactive*. They can also be assigned on a prop through the UI.

## From a sketch

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

See [Triggers API docs](../api/triggers.md) for usage.

## From the UI

Triggers can also added on specific type of fields from the UI, by clicking on the label of a field. Triggers can only be added when the type of a prop is a `function` or a number with `params: { min, max }`.

They are saved in localStorage so they persist between refreshs. This is useful when you want to quickly test or prototype values.

![Screen capture of Fragment, displaying a "color" field with the triggers UI opened and 3 triggers (onMouseDown, onKeyDown and onNoteOn setted](https://github.com/raphaelameaume/fragment/raw/main/docs/guide/triggers.png?raw=true "Screen Capture of Fragment UI for triggers")

The dot on the left shows if a trigger is active or not. You can toggle activity by clicking on it.
