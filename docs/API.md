#### <sup>[fragment](../README.md) → [Documentation](./README.md) → API</sup>
<br>

# CLI


# Sketch

```js
init();
resize();
update();
```

- `export let init = ({ canvas, width, height, ...params })`: `function:void`
#### canvas
Type: `HTMLCanvasElement`
#### width
Type: `number`
#### height
Type: `number`
#### params
Type: `object`

Depending on the rendering context, params will contain different things.

⚠ Notice the spread operator `...` before `params`, this means that the rest of the object will be "collected" into a single object call `params`. The values defined above are available directly if you want:

```js
export let rendering = "2d";

export let init = ({ context, width, height }) => {
	context.fillStyle = '#ff0000';
};
```

- `export let update = ({ time, deltaTime, ?playhead, ?playcount }) => {}`: `function:void`
#### time
Type: `number`

#### deltaTime
Type: `number`

#### playhead
Type: `number`

#### playcount
Type: `number`

- `export let resize = ({ width, height, pixelRatio })`: `function:void`

- `export let props = {}`: `object`

See [Props](./API.md#props) for details.

- `export let rendering = "2d"`: `string`

- `export let duration = 10`: `number`

Enable sketch loop. Default to `undefined`

- `export let fps = 60`: `number`

Change the framerate. Default to `60`

- `export let filenamePattern = ({ filename, suffix, year, month, day, hours, minutes, seconds }) => {}`: `function:string`

Change the filename when exporting a file. Default to `filename.suffix.[extension]`;

# Props

# Renderer

# Modules

# Shortcuts

# Triggers
