# Exports

Fragment supports a variety of export approaches suitable for storing, sharing, and showcasing sketches.

## Exporting an image

Fragment supports exporting still images in PNG, WEBP, and JPEG formats. The Exports module allows adjustment of parameters such as `encoding`, `quality`, and `pixelsPerInch`.

The resolution of the exported image corresponds to the canvas resolution currently rendered on-screen. For high-resolution output, the canvas `dimensions` or `pixelRatio` should be increased before exports are triggered.

> Note: `pixelsPerInch` modifies metadata only; it does not alter the pixel dimensions of the exported image. This prevents external software from interpreting the export as 72dpi by default.

For print-ready output, set `canvasSize` in Params to preset, choose a print size from the preset menu, and set `pixelsPerInch` to 300 before initiating the export.

Pressing `Cmd+S` on macOS or `Ctrl+S` on Windows will save a screenshot with the configured settings into the working directory.

## Exporting a batch of images

Batch exporting allows several images to be rendered and saved automatically in sequence. This is useful for generating variations of a sketch (such as different seeds, parameters, or states) without having to trigger each export manually.

Increasing the `count` value in the Exports module determines how many images will be produced. Fragment calls the `update()` function of the sketch between each capture, and hooks can be used to run custom logic after every export.

The following example generates multiple images by applying a new random seed after each captured frame:

```js
// Export a batch of renders using different seeds
import { onAfterCapture } from '@fragment/hooks';

function generateSeed() { /**  */}

let props = {
	seed: {
		value: generateSeed()
	}
};

export let init = () => {
  onAfterCapture(() => {
    props.seed.value = generateSeed();
  });
};

export let update = () => {
  random.setSeed(props.seed.value);

  // ...
};

export let filenamePattern = ({ filename, timestamp, props }) => {
  return `${filename}.${timestamp}.seed=${props.seed.value}`;
}

```

## Exporting a video

Fragment can generate MP4, GIF, and WEBM video exports, as well as frame sequences for external compositing.

Framerate, encoding format, and output quality can be configured in the Exports module.

If useDuration is enabled and the sketch exports a [duration](../api/sketch.md#duration) property, Fragment will automatically determine when to end recording based on the number of frames required at the specified framerate. This behavior is especially useful for loop-based animations.

When loopCount is greater than 1, recording will continue until enough frames have been collected to render the sketch for the entire loop sequence. The total frame count equals `duration * loopCount * framerate`, allowing variations to be captured across repeated loops.

> The recording framerate can be independent of the [sketch's runtime framerate](../api/sketch.md#duration).


## Changing the filename

By default, Fragment names exported files using the sketch filename and a timestamp, such as:

```sketch.js.2022.05.27-08.30.00.[extension]```

This behavior can be customized via the [`filenamePattern`](../api/sketch.md#filenamepattern) export.

## Changing the directory of exports

By default, exports are saved to the working directory from which Fragment was launched. A custom directory can be defined by setting `exportDir` in your config file or in your sketch file:

```js
// fragment.config.js
export default {
  exportDir: "/path/to/custom/directory"
}
```

```js
// sketch.js
export let exportDir = "/path/to/custom/directory";
```
