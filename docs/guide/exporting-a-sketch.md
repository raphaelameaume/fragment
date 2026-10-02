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

Fragment can export MP4, MOV, MKV, WEBM and GIF videos, as well as frame sequences (PNG, JPEG, WEBP) for external compositing.

Framerate, format, codec and output quality can be configured in the Exports module. GIF exports are capped at 50fps.

If duration is set to `manual`, the recording will go on until stopped. If duration is set to `custom` or `sketch`, Fragment will automatically end the recording once the number of frames required at the specified framerate has been captured. When using `sketch`, the sketch needs to export a [duration](../api/sketch.md#duration) property. This is especially useful for loop-based animations.

When `loopCount` is greater than 1, recording will continue until enough frames have been collected to render the sketch for the entire loop sequence. The total frame count equals `duration * loopCount * framerate`, allowing variations to be captured across repeated loops.

By default, recording happens in realtime: frames are captured at the pace of the specified framerate, so live input such as mouse interaction is recorded as it happens. If the sketch can't keep up with the framerate, that input will appear slowed down in the export.

Disabling realtime renders frames as fast as possible, which can make exports much quicker, but live input will appear sped up. Use it for animations that only depend on time.

> The recording framerate can be independent of the [sketch's runtime framerate](../api/sketch.md#duration).


## Changing the filename

By default, Fragment names exported files using the sketch filename and a timestamp, such as:

```sketch.js.2022.05.27-08.30.00.[extension]```

This behavior can be customized via the [`filenamePattern`](../api/sketch.md#filenamepattern) export.

## Changing the directory of exports

By default, exports are saved to the working directory from which Fragment was launched. A custom directory can be defined by setting `exportDir` in your sketch file:

```js
export let exportDir = "/path/to/custom/directory";
```

## Committing your changes

Fragment can automatically create commits using the keyboard shortcut `Cmd/Ctrl + K`. Each commit captures the canvas based on the Exports settings and saves it to disk along with a JSON file containing the current props values. 
This lets you return to a specific version of your sketch, whether changes were made through code or the GUI.
This is especially useful for generative art workflows when the seed is exposed via props or [`filenamePattern`](../api/sketch.md#filenamepattern)
