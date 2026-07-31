# Renderers

A **renderer** is a system that takes sketches as input and outputs their results to a canvas. A renderer should be capable of displaying multiple sketches of the same rendering simultaneously in the most efficient way possible, sharing resources between sketches whenever feasible.

To function properly, a renderer must implement the [lifecycle functions](#lifecycle) described below.

## Lifecycle

### `init`
- Type: `({ canvas: HTMLCanvasElement, width: number, height: number, pixelRatio: number }) => InitParams`

Called once when the first sketch with a matching rendering is mounted. This is useful for creating and storing shared resources that can be reused across sketches.

The object returned from this function is spread into the parameters of all sketch lifecycle functions.

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

### `onMountPreview`
- Type: `({ id: number, canvas: HTMLCanvasElement, container: HTMLElement, width: number, height: number, pixelRatio: number }) => MountParams`

Called every time a sketch is mounted or hot-reloaded.

The returned object is also spread into the sketch lifecycle parameters. If a key exists in both `InitParams` and `MountParams`, the value from onMountPreview overrides the init() value.

```js
// renderer.js
export let onMountPreview = ({ id }) => {
	return {
		previewId: id,
	};
};

// sketch.js
export let update = ({ previewId }) => {
	console.log(previewId); // 0
};
```

### `onResizePreview`
- Type: `({ id: number, canvas: HTMLCanvasElement, container: HTMLElement, width: number, height: number }) => void`

Called whenever OutputParams.canvasSize or OutputParams.dimensions change for a specific preview.

### `onBeforeUpdatePreview`
- Type: `({ id: number, canvas: HTMLCanvasElement, container: HTMLElement }) => void`

Called before `sketch.update()` on each frame.

### `onAfterUpdatePreview`
- Type: `({ id: number, canvas: HTMLCanvasElement, container: HTMLElement }) => void`

Called after `sketch.update()` on each frame.

### `onDestroyPreview`
- Type: `({ id: number, canvas: HTMLCanvasElement, container: HTMLElement }) => void`

Called when a sketch is unmounted or hot reloaded.

### `resize`
- Type: `({ width: number, height: number, pixelRatio: number }) => void`

Called once when OutputParams.canvasSize or OutputParams.dimensions change.
