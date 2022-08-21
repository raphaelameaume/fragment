#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Exports</sup>
<br>

# Exports

`fragment` provides different ways to export sketches, whereas it's for diffusion or archive purposes. It currently supports image, video and live exports.

Settings of the `Exports` module are saved in localStorage so they will be kept between working sessions as long as `fragment` starts on the same URL/port.

## Export an image

`fragment` can export .png, .webp and .jpeg files.

You can change `encoding`, `quality` and `pixelsPerInch` in the module settings.

The size of the image used when exporting will be the current one used for display. If you want to create hi-res exports, make sure to change the `dimensions` or `pixelRatio` of the canvas before doing so.

> ⚠️ `pixelsPerInch` doesn't actually changed the resolution of the final exports, it only changes file metadata so it doesn't appear as a 72dpi file when opened in other softwares.

If you need to export a sketch for impression, set `canvasSize` in Params to `preset`. Select the size you want in the new `preset` dropdown and set `pixelsPerInch` to `300` before exporting.

Type `Cmd+S` on Mac or `Ctrl+S` on Windows to save a screenshot with selected settings into your working folder.

## Export a video

`fragment` can export .mp4, .gif, .webm videos and frame sequences.

You can change the `framerate`, the `encoding` and the `quality` of the recording in the module settings.

If `useDuration` is `true` and a sketch exports a [duration](../api/sketch.md#duration) property, the recording will stop once `fragment` has exported enough frames to compose the recording at specified framerate. This can be useful to export loop-based sketchs.

If `loopCount` is greater than 1, the recording will stop once fragment has enough frames to compose the recording for a final duration equals to sketchDuration*loopCount. This can be useful to export loop-based sketchs with variations between loops.

> ⚠️ The `framerate` used for recording can be different from sketch [fps](../api/sketch.md#duration) property.

## Export a live version

@TODO

## Change the filename

By default, `fragment` will use the sketch filename and a timestamp to name your export like `sketch.js.2022.05.27-08.30.00.[extension]`. See [filenamePattern](../api/sketch.md#filenamepattern) to change this behavior.
