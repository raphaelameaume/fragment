#### <sup>[fragment](../README.md) → [Documentation](./README.md) → API</sup>
<br>

# Sketch

```js
init();
resize();
update();
```

#### `init`
- Type: `({ canvas: HTMLCanvasElement, width: number, height: number, ...params: object}) => void`

Depending on the rendering context, params will contain different things.

> ⚠ Notice the spread operator `...` before `params`, this means that the rest of the object will be "collected" into a single object call `params`. The values defined above are available directly if you want:

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

See [Props](./API.md#props) for details.

#### `rendering`
- Type: `string`
- Values: `2d`, `three`, `p5`, `fragment`
- Default: `2d`

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
- Default: `({ filename, suffix }) => filename.suffix`

Change the filename when exporting a file. 
