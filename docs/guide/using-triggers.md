# Using triggers

Triggers are functions you can call imperatively from your sketch file to make it *interactive*. They can also be assigned on a prop through the UI.

## From a sketch

Instead of manually setting up event listeners:

```js
export let init = ({ canvas }) => {
    canvas.addEventListener('click', (event) => {
		console.log("canvas clicked");
	});
}
```

Triggers can be imported and used directly within a sketch:

```js
import { onClick } from "@fragment/triggers";

export let init = ({ canvas }) => {
	onClick((event) => {
		console.log("canvas clicked");
	});
}
```

See the [Triggers API documentation](../api/triggers.md) for details.

## From the UI

Triggers can also added on specific type of fields from the UI, by clicking on the label of a field. Triggers can only be added when the type of a prop is a `function` or a number with `params: { min, max }`.

Assigned triggers are stored in Local Storage, ensuring persistence across refreshes. This is particularly useful for rapid testing or prototyping.

![Screen capture of Fragment, displaying a "color" field with the triggers UI opened and 3 triggers (onMouseDown, onKeyDown and onNoteOn setted](https://github.com/raphaelameaume/fragment/raw/main/docs/guide/triggers.png?raw=true "Screen Capture of Fragment UI for triggers")

A dot to the left of each trigger indicates whether it is currently active. Clicking the dot toggles its active state.
