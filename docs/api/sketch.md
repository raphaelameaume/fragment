#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → Sketch</sup>
<br>

# Sketch

A sketch in `fragment` is the entry point of your project.

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
- Type: `({ canvas: HTMLCanvasElement, width: number, height: number, ...params: object}) => void`

Depending on the rendering context, params will contain different things.

> ⚠ Notice the spread operator `...` before `params`, this means that the rest of the object will be "collected" into a single object called `params`. The values defined above are available directly if you want:

```js
export let rendering = "2d";

export let init = ({ context, width, height }) => {
	context.fillStyle = '#ff0000';
};
```

#### `update`
- Type: `({ time: number, deltaTime: number, playhead: number, playcount: number }) => void`

#### `resize`
- Type: `({ width: number, height: number, pixelRatio: number }) => void`

#### `props`
- Type: `SketchProps`

See [SketchProps](./#sketchprops) for details.

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

Enable sketch loop.

#### `fps`
- Type: `number`
- Default: `60`

Change the framerate.

#### `filenamePattern`
- Type: `({ filename: string, suffix: string, year:string, month:string, day:string, hours:string, minutes:string, seconds:string, props: SketchProps }) => string`
- Default: `({ filename, suffix }) => ${filename}.${suffix}`

Change the filename when exporting a file.

## SketchProps

You can define `props` in your sketch files in order to create GUI elements and use their values directly in your code. `fragment` will attempt to infer the type of field you want based on values and params of the props.

| type | params | field |
|---|---|---|
| `number` | { disabled?: `boolean`, step?: `number` } | `<NumberInput>` |
| `number` | { min:`number`, max: `number` } | `<ProgressInput>` + `<NumberInput>` |
| `number` | { options?: `value[] | object[{label: string, value:number}]`} | `<SelectInput>`|
| `string` | { disabled?: `boolean`} | `<TextInput>`|
| `string` | { options?: `string[] | object[{label: string, value:string}]`} | `<SelectInput>`|
| `function` | { label?: `string` } | `<ButtonInput>`|
| `number[](2)` | { locked?: `boolean` } | `<Vec2Input>`|
| `number[](3)` | { locked?: `boolean` } | `<Vec3Input>`|

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

## Templates

`fragment` comes with a bunch of pre-defined templates. See [CLI docs](./CLI.md#templates) for details.

## Interactivity

You can set up *triggers* in your sketch files to make them **interactive**. See [Triggers docs](./triggers.md) for details.
