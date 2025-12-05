# Sketch

A **sketch** in Fragment is the entry point of a project. Its API is simple, supports multiple rendering types, and can grow in complexity as needed.

A sketch is composed of lifecycle functions, exports, and optional props, which enable both rendering and interactivity.

## Lifecycle

Each time a sketch is saved, the previous instance is destroyed and a new **lifecycle** begins. Internally, Fragment calls available [exports](./#exports) in the following order:

```js
await sketch.load();
await sketch.init();
sketch.resize();
sketch.update();

// on hot reload, dispose previous instance
sketch.dispose();

// new lifecycle
await sketch.load();
await sketch.init();
sketch.resize();
sketch.update();
```

## Exports

Fragment uses [named ESM exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export). Multiple properties can be exported from the sketch entry point, and they will be automatically picked up at runtime.

### `load`

- Type: `({ canvas: HTMLCanvasElement, width: number, height: number, pixelRatio, publicPath, ...params: {...InitParams, ...MountParams }}) => void`

`load()` is called first. Fragment waits for the returned Promise to resolve before calling `init()`. This is useful for preloading assets (images, models, fonts, etc.).

```js
export let load = ({ publicPath }) => {
  await loadImage(`${publicPath}/assets/image.jpg`);
}
```

### `init`
- Type: `({ canvas: HTMLCanvasElement, width: number, height: number, pixelRatio: number, publicPath: string, ...params: {...InitParams, ...MountParams }}) => void`

Called once after load(). Used to initialize resources or context for a sketch. Returned parameters are spread into all lifecycle functions.

> Notice the spread operator `...` before `params`, this means that the rest of the object will be "collected" into a single object called `params`. The values defined here are available directly if you want:

#### `rendering = "2d"`
| name | type | description |
|---|---|---|
| `context` | `CanvasRenderingContext2D` | The context of the canvas |
#### `rendering = "three"`
| name | type | description |
|---|---|---|
| `renderer` | `THREE.WebGLRenderer` | The three.js WebGLRenderer |
| `scene` | `THREE.Scene` | A instance of THREE.Scene |
#### `rendering = "p5"`
| name | type | description |
|---|---|---|
| `p` | `p5Instance` | The p5 instance |
#### `rendering = "p5-webgl"`
| name | type | description |
|---|---|---|
| `p` | `p5Instance` | The p5 instance |
#### `rendering = "fragment"`
| name | type | description |
|---|---|---|
| `frag` | `fragmentInstance` | The fragment instance |

```js
export let rendering = "2d";

export let init = ({ context, width, height }) => {
  context.fillStyle = '#ff0000';
};
```

### `update`
- Type: `({ time: number, deltaTime: number, playhead?: number, playcount?: number }) => void`

| name | type | description |
|---|---|---|
| time | `number` | Amount of time ellapsed since the start of fragment. In milliseconds |
| deltaTime | `number` | Amount of time ellapsed since the last frame. In milliseconds |
| playhead | `number` | If [`duration`](#duration) is defined, playhead will go from 0 to 1 every specified duration |
| playcount | `number` | If [`duration`](#duration) is defined, playcount will increase of 1 every loop |
| frame | `number` | If [`duration`](#duration) is defined, frame will increase depending on fps and duration |

### `resize`
- Type: `({ width: number, height: number, pixelRatio: number }) => void`

Called when the canvas size or pixel ratio changes.

### `props`
- Type: `Props`

See [Props](/docs/api/props.md) for details.

### `rendering`
- Type: `'2d' | 'three' | 'p5' | 'p5-webgl' | 'fragment'`
- Default: `undefined`

Selects one of Fragment's built-in rendering engines.

```js
export let rendering = '2d';
```

### `renderer`

- Type: `() => Promise<Module>`

Registers a custom renderer module that defines how the sketch output is displayed and updated.
Can be imported directly or dynamically using a function.

```js
export let renderer = () => import('./custom-renderer.js');
```

> `renderer` is used to define or import a custom rendering system (e.g., SVG or WebGL). This differs from `rendering`, which references built-in renderers and is used internally for caching.

### `duration`
- Type: `number`
- Default: `undefined`

Setting a duration to a sketch will compute correct values for `playhead` and `playcount` in [`update`](#update) callback params.

### `fps`
- Type: `number`
- Default: `undefined` (uses the display's native refresh rate)

Controls how often update() is called per second.

By default, Fragment synchronizes with the monitor's refresh rate using `requestAnimationFrame`, ensuring smooth playback regardless of the display (commonly 60 FPS, but may vary on high-refresh monitors).

Setting a custom value (e.g. `30`) will decouple the sketch's update rate from the display's refresh rate and call `update()` at that fixed interval instead.

Setting it to `0` calls `update()` only once at the end of the lifecycle and whenever `props` change.

### `name`
- Type: `string`
- Default: `[filename]`

Change the value used for display in the monitor dropdown.

### `exportDir`
- Type: `string`
- Default: `process.cwd()`

Directory for exports, relative or absolute.

```js
// relative path
export let exportDir = './exports';
// absolute path
export let exportDir = '/Users/raphaelameaume/Downloads';
```

> This is ignored if Fragment is started with the `--exportDir` CLI flag.

### `filenamePattern`
- Type: `({ filename: string, timestamp: string, year:string, month:string, day:string, hours:string, minutes:string, seconds:string, props: SketchProps }) => string`
- Default: `({ filename, timestamp }) => ${filename}.${timestamp}`

Customize filenames of exports. Props are available for dynamic patterns.

```js
export let filenamePattern = ({ filename, timestamp, props }) => {
  return `${filename}.${timestamp}.seed=${props.seed.value}`;
}
```
