# Exports

Fragment provides different ways to export sketches, whereas it's for communication or archive purposes. It currently supports image, video and live exports.

---

Settings of the Exports module are saved in localStorage so they will be kept between working sessions as long as Fragment starts on the same URL and port.

## Export one or multiple images

Fragment can export PNG, WEBP and JPEG files.

You can change `encoding`, `quality` and `pixelsPerInch` in the Exports module settings.

The size of the image used when exporting will be the current one used for display. If you want to create hi-res exports, make sure to change the `dimensions` or `pixelRatio` of the canvas before doing so.

> `pixelsPerInch` doesn't actually changed the resolution of the final exports, it only changes file metadata so it doesn't appear as a 72dpi file when opened in other softwares.

If you need to export a sketch for impression, set `canvasSize` in Params to `preset`. Select the size you want in the new `preset` dropdown and set `pixelsPerInch` to `300` before exporting.

Type `Cmd+S` on Mac or `Ctrl+S` on Windows to save a screenshot with selected settings into your working folder.

You can also export multiple images by increasing the `count` value in the module settings. `fragment` will run the `update()` function of your sketch between each capture. `fragment` provides *hooks* to run a function between captures.

```js
// Export a batch of renders using different seeds
import { onAfterCapture } from '@fragment/hooks';

let seed = randomSeed();

export let init = () => {
  onAfterCapture(() => {
    seed = randomSeed();
  });
};

export let update = () => {
  random.setSeed(seed);

  // ...
};
```

## Export a video

Fragment can export MP4, GIF, WEBM videos and frame sequences.

You can change the `framerate`, the `encoding` and the `quality` of the recording in the Exports module settings.

If `useDuration` is `true` and a sketch exports a [duration](../api/sketch.md#duration) property, the recording will stop once Fragment has exported enough frames to compose the recording at the specified framerate. This can be useful to export loop-based sketchs.

If `loopCount` is greater than 1, recording will stop once Fragment has enough frames. The total number of frames equals to `sketchDuration*loopCount`. This can be useful to export loop-based sketchs with variations between loops.

> The `framerate` used for recording can be different from the [sketch framerate](../api/sketch.md#duration).

## Export a live version

A sketch can be built into static files (html, js, css) to be deployed anywhere online.

```bash
fragment ./sketch.js --build
```

The static build can be configured from the sketch file by exporting a `buildConfig` object.

```js
export let buildConfig = {
  backgroundColor: "red",
  dimensions: [256, 256],
  gui: {
    position: "float",
    align: "left",
    size: 0.4,
    output: false,
	},
  styles: /* css */`
    :root {
      --color-active: red;
    }

    canvas {
      box-shadow: 0px 2px 12px -2px rgba(0, 0, 0, 0.35);
    }
  }`
};
```

| name | type | effect | default |
|---|---|---|---|
| `backgroundColor` | `string` | Change the background color when canvas is not full size | `inherit` |
| `dimensions` | `number[2]` | Change the dimensions of the canvas | Viewport size |
| `canvasSize`| `string` | Change the resizing method of the canvas. Can be `window`, `fixed`, `scale`, `preset`, `aspect-ratio` | `window` |
| `pixelRatio` | `number\|function` | Change the pixel ratio of the canvas. | `1` |
| `layout` | `object` | Change the layout options | `{}` |
| `layout.resizable` | `boolean` | Enable resizing of the modules | `true` |
| `layout.headless` | `boolean` | Hide modules headers | `false` |
| `layout.persistent` | `boolean` | Preserve resizing between reloads | `false` |
| `layout.component` | `SvelteComponent` | Swap the BuildLayout component | `undefined` |
| `gui` | `boolean\|object` | Display gui | `false` |
| `gui.position` | `string` | Change gui appearance. Can be `fixed` or `float` | `float` |
| `gui.align` | `string` | Change gui position. Can be `left` or `right` | `right` |
| `gui.size` | `string\|number` | Change gui width. Can be a percentage or a number between 0 and 1 | `0.3`
| `gui.output` | `string\|number` | Display canvasSize and dimensions fields in gui | `false` |
| `gui.hidden` | `boolean` | Hide gui on start | `false` |
| `styles` | `string` | Inject styles in document | `false` |

A built sketch can be previewed on dev mode by typing `p`.

## Change the filename

By default, Fragment will use the sketch filename and a timestamp to name your export like `sketch.js.2022.05.27-08.30.00.[extension]`. See [filenamePattern](../api/sketch.md#filenamepattern) to change this behaviour.

## Change the directory of exports

By default, Fragment will use the directory where the command was started (`process.cwd()`) for saving the exports. This can be changed by specifying the `exportDir`.

```js
export let exportDir =/path/to/custom/directory`;
```
