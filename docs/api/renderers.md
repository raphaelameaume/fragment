# Renderers

They described systems that take *sketchs* as input and output their results to a canvas. A renderer should be capable of displaying multiple skeches of the same *rendering* at the same time in the most efficient way possible, meaning it should share ressources between sketches whenever possible.

A renderer should implement [lifecycle functions](#lifecycle-functions) as described here in order to work properly.

## Lifecycle functions

#### `init`
- Type: `() => InitParams`

Called once on the first time a sketch with matching rendering is mounted. Useful to create and save ressources that will be shared across sketches. The object returned from this function will spread as params and made available to sketch lifecycle functions.

Example:
```js
// renderer.js
export let init = () => {
	let renderer = createRenderer();
	let value = true;

	return {
		renderer,
		value,
	}
};

// sketch.js
export let init = ({ renderer, value }) => {
	console.log(value); // true
};
```

#### `onMountPreview`
- Type: `({ index: number, canvas: HTMLCanvasElement, container: HTMLElement, width: number, height: number, pixelRatio: number }) => MountParams`

Called everytime a sketch is mounted or hot reloaded. The object returned from this function will spread as params and made available to the sketch lifecycle functions.

```js
// renderer.js
export let onMountPreview = ({ index }) => {
	return {
		previewIndex: index,
	};
};

// sketch.js
export let update = ({ previewIndex }) => {
	console.log(previewIndex); // 0
};
```

> ⚠️ InitParams and MountParams are both spread at the same level and in this order, so if you export an object key from `init()` and the same key for a different value from `onMountPreview`, `onMountPreview` value will take over when the parameters are merged like this `{...InitParams, ...MountParams }`.

#### `onBeforeUpdatePreview`
- Type: `({ index: number, canvas: HTMLCanvasElement, container: HTMLElement }) => void`

Called on each frame before `sketch.update()`.

#### `onAfterUpdatePreview`
- Type: `({ index: number, canvas: HTMLCanvasElement, container: HTMLElement }) => void`

Called on each frame after `sketch.update()`.

#### `onResizePreview`
- Type: `({ index: number, canvas: HTMLCanvasElement, container: HTMLElement, width: number, height: number }) => void`

Called for each preview when OutputParams.canvasSize or OutputParams.dimensions change.

#### `onDestroyPreview`
- Type: `({ index: number, canvas: HTMLCanvasElement, container: HTMLElement }) => void`

Called when a sketch is unmounted or hot reloaded.

#### `resize`
- Type: `({ width: number, height: number, pixelRatio: number }) => void`

Called once when OutputParams.canvasSize or OutputParams.dimensions change.
