#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Getting started</sup>
<br>

# Getting started

## Create a sketch

In your terminal, type the following command to create a new sketch based on the 2D template.
```
fragment ./sketch.js --new --template=2d
```
Check [Templates docs](../api/CLI.md#templates) to see which templates are also available.

Open `sketch.js` recently created in your favorite code editor. The file should looks like this:

```js
export let props = {};

export let init = ({ context, width, height }) => {

};

export let update = ({ context, width, height, time, deltaTime }) => {
	context.clearRect(0, 0, width, height);
};

export let resize = ({ width, height }) => {

};

export let rendering = "2d";
```

## Draw a circle

Let's start by drawing a centered circle on the canvas. Because we used the `2d` template, the `update` function exposes a `context` param, which can be used to draw. See [CanvasRenderingContext2D docs](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) if you want to know more about what can be done with `context`.

```js
export let update = ({ context, width, height }) => {
  // set the fill color to black
  context.fillStyle = '#000000';
  // draw a rectangle covering the entire canvas
  context.fillRect(0, 0, width, height);

  // choose a radius for your canvas
  const radius = 20;

  // change the fill color to blue
  context.fillStyle = '#0000ff';
  // draw the circle
  context.beginPath();
  context.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI, false);
  // fill the previous path drawing with the current fillStyle
  context.fill(); 
};
```

## Create a GUI

In order to quickly create controls on the screen, `fragment` checks for an existing `props` object exported from your sketch. The controls will be built based on the type of values in the `props` object.

Let's create our first prop `radius`. 

```js
export let props = {
	radius: {
		value: 20,
	}
};

export let update = () => {
	// draw background
  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  const radius = props.radius.value; // get value from props object available in the scope

  context.fillStyle = '#0000ff';
  context.beginPath();
  context.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI, false);
  context.fill();
}
```

You should see a new input field under `Parameters` labelled `radius`. Try changing the value, the canvas will redraw according to your new value. That's great but it's not ideal to manually enter a new value each time.

Each `prop` can have a special property `params`. If the `[propName].value` is a `number`, then `params` can accept three new properties `min`, `max` and `step`.

Let's add them:
```js
export let props = {
	radius: {
		value: 20,
    params: {
      min: 1,
      max: 200,
      step: 1,
    }
	}
};
```

A slider should have appeared after saving the sketch file next to the previous input. Now if you click and drag on the slider, you should see your circle changing live.

Congrats, you made your first sketch in `fragment`! 

If you want to know more about `props` and what can be done with it, check out the [SketchProps](../api/sketch.md#sketchprops) section of the documentation.


## Next steps

- [Using triggers](./using-triggers.md)
- [Exporting a sketch](./exports.md)
