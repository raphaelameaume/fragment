#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → Hooks</sup>
<br>

# Hooks

Hooks provide a way to trigger functions in your sketch on specific features from `fragment`. They need to be declared in `init()` or `setup()` functions of your sketchs otherwise you might need to handle the subscriptions manually (not recommended).

## Usage

Hooks can be imported through the special alias `@fragment/hooks`.

```js
import { onAfterCapture } from '@fragment/hooks';

let seed = randomSeed();

export let init = () => {
  onAfterCapture(() => {
    seed = randomSeed();
  });
};

export let update = () => {
  random.setSeed(seed);
};
```

`fragment` takes care of removing the subscriptions between each change of the sketch so you don't need to, as long as they are declared inside `init`.

#### `onBeforeCapture`
- Type: `(callback({ encoding: string, quality: number, count: number, index: number, pixelsPerInch: number }): function) => function`

Register a callback that will run before the canvas is captured (either through `Cmd+S` or the `Capture` button of the Exports module). Returns a function to unregister the callback.

#### `onAfterCapture`
- Type:  `(callback({ encoding: string, quality: number, count: number, index: number, pixelsPerInch: number }): function) => function`

Register a callback that will run after the canvas is captured (either through `Cmd+S` or the `Capture` button of the Exports module). Returns a function to unregister the callback.

#### `onBeforeRecord`
- Type: `(callback({ encoding: string, quality: number, framerate: number })) => function`

Register a callback that will run before the canvas is recorded (either through `Ctrl+Shift+S` or the `Record` button of the Exports module). Returns a function to unregister the callback.

#### `onAfterRecord`
- Type: `(callback({ encoding: string, quality: number, framerate: number })) => function`

Register a callback that will run after the canvas is recorded (either through `Ctrl+Shift+S` or the `Record` button of the Exports module). Returns a function to unregister the callback.
