#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → Sketch</sup>
<br>

# Sketch

A sketch in `fragment` is the entry point of your project. Its API is fairly simple, supports different types of renderings and can grow in complexity.

## Lifecycle

Each time your sketch is saved, the previous one is destroyed and a new *lifecycle* is called. Internally, `fragment` will call available [exports](./#exports) from your sketch in this specific order.

```js
sketch.init();
sketch.resize();
sketch.update();
```

## Exports

`fragment` leverages the power of [named ESM exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export), meaning that you can export various properties from your sketch entry point and they will be picked up on runtime.

#### `init`
- Type: `({ canvas: HTMLCanvasElement, width: number, height: number, pixelRatio, ...params: {...InitParams, ...MountParams }}) => void`

| name | type | description |
|---|---|---|
| canvas | `HTMLCanvasElement` | The canvas element used for drawing |
| width | `number` | Width of the canvas |
| height | `number` | Height of the canvas |
| pixelRatio | `number` | PixelRatio of the canvas |

Depending on the rendering context, params can contain different things.

> ⚠ Notice the spread operator `...` before `params`, this means that the rest of the object will be "collected" into a single object called `params`. The values defined here are available directly if you want:

##### `rendering = "2d"`
| name | type | description |
|---|---|---|
| `context` | `CanvasRenderingContext2D` | The context of the canvas |
##### `rendering = "p5"`
| name | type | description |
|---|---|---|
| `p` | `p5Instance` | The p5 instance |
##### `rendering = "three"`
| name | type | description |
|---|---|---|
| `renderer` | `THREE.WebGLRenderer` | The three.js WebGLRenderer |
| `scene` | `THREE.Scene` | A instance of THREE.Scene |
##### `rendering = "fragment"`
| name | type | description |
|---|---|---|
| `frag` | `fragmentInstance` | The fragment instance |

```js
export let rendering = "2d";

export let init = ({ context, width, height }) => {
  context.fillStyle = '#ff0000';
};
```

#### `update`
- Type: `({ time: number, deltaTime: number, playhead?: number, playcount?: number }) => void`

| name | type | description |
|---|---|---|
| time | `number` | Amount of time ellapsed since the start of fragment. In milliseconds |
| deltaTime | `number` | Amount of time ellapsed since the last frame. In milliseconds |
| playhead | `number` | If [`duration`](#duration) is defined, playhead will go from 0 to 1 every specified duration |
| playcount | `number` | If [`duration`](#duration) is defined, playcount will increase of 1 every loop |

#### `resize`
- Type: `({ width: number, height: number, pixelRatio: number }) => void`

| name | type | description |
|---|---|---|
| width | `number` | Width of the canvas |
| height | `number` | Height of the canvas |
| pixelRatio | `number` | PixelRatio of the canvas |

#### `props`
- Type: `SketchProps`

See [SketchProps](#sketchprops) for details.

#### `rendering`
- Type: `string`
- Values: `2d`, `three`, `p5`, `fragment`
- Default: `2d`

> ⚠ If you used either `three` or `p5` rendering, you'll need to install them from your project root directory in order to make it work.

```
npm install three --save
```

#### `duration`
- Type: `number`
- Default: `undefined`

Setting a duration to a sketch will compute correct values for `playhead` and `playcount` in [`update`](#update) callback params.

#### `fps`
- Type: `number`
- Default: `60`

Change how many times `update()` is called in 1 second. Py default, the value is 60, meaning `update()` will be called on every *requestAnimationFrame*.
If you set it to `0`, `fragment` will only call `update()` once at the end of the *lifecycle* and when `props` change.

#### `name`
- Type: `string`
- Default: `[filename]`

Change the value used for display in the monitor dropdown.

#### `filenamePattern`
- Type: `({ filename: string, suffix: string, year:string, month:string, day:string, hours:string, minutes:string, seconds:string, props: SketchProps }) => string`
- Default: `({ filename, suffix }) => ${filename}.${suffix}`

Change the filename pattern when exporting a file. By default, `fragment` will use the sketch filename and a timestamp to name your export like `sketch.js.2022.05.27-08.30.00.[extension]`.

In order to reuse the timestamp in your own pattern, `suffix` is available as a parameter within the callback, but you can also deconstruct `{ year, month, day, hours, minutes, seconds}` to make up your own.

> ⚠️ You don't need to specify the extension since this is handled internally by the [Exports](./modules.md#exports) module.

The callback is also returning the sketch current props so you can use their values in your export name.

Example: 

```js
export let filenamePattern = ({ filename, suffix, props }) => {
  return `${filename}.${suffix}.radius=${props.radius.value}`;
}
```

## SketchProps

You can define `props` in your sketch files in order to create GUI elements and use their values directly in your code. `fragment` will attempt to infer the type of field you want based on values and params of the props.

| value type | params | field |
|---|---|---|
| `number` | { disabled?: `boolean`, step?: `number` } | `<NumberInput>` |
| `number` | { min:`number`, max: `number` } | `<ProgressInput>` + `<NumberInput>` |
| `number` | { options?: `number[] \| object[{label?: string, value:number}]`} | `<SelectInput>`|
| `string` | { disabled?: `boolean`} | `<TextInput>`|
| `string` | { options?: `string[] \| object[{label?: string, value:string}]`} | `<SelectInput>`|
| `function` | { disabled?: `boolean`, label?: `string` } | `<ButtonInput>`|
| `number[]` | { locked?: `boolean` } | `<VectorInput>`|

Example:
```js
export let props = {
  radius: {
    value: 10,
    params: {
        min: 1,
        max: 30,
        step: 0.1
    }
  }
};

// use props.radius.value
export let update = ({ context }) => {
  const radius = props.radius.value;

  context.arc(x, y, radius, 0, 2 * Math.PI); 
};
```

You can force a type on a prop by assigning a `type` to your object like so:

```js
export let props = {
  color: {
    value: [255, 0, 255],
    type: "color",
  }
}
```

You can also add a listener if you want to trigger a function when the prop value changes.

```js
function onColorChange({ value }) {
  console.log("color has changed!", value);
}

export let props = {
  color: {
    value: [255, 0, 255],
    type: "color",
    onChange: onColorChange,
  }
}
```

A prop can be `hidden` so it doesn't show up in the Parameters module or in `build` mode.

```js
export let props = {
  color: {
    value: [255, 0, 255],
    hidden: __PRODUCTION__,
  }
}
```

## Templates

`fragment` comes with a bunch of pre-defined templates. See [CLI docs](./CLI.md#templates) for details.

## Interactivity

You can set up *triggers* in your sketch files to make them **interactive**. See [Triggers docs](./triggers.md) for details.
