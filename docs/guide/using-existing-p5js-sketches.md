#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Using existing p5.js sketches</sup>

# Using existing p5.js sketches

In case you already have a few sketches around, you can port them to Fragment in a few steps with very little changes and then enjoy the features Fragment provides such as video and images exports, using MIDI inputs to trigger functions or deploy something online.

1. Install Fragment following the [Installation](../../README.md#installation) instructions
2. Create a new JavaScript file and paste the code from your existing sketch. Let's use the following code for example:

```js
// From https://p5js.org/examples/form-triangle-strip.html

let x;
let y;
let outsideRadius = 150;
let insideRadius = 100;

function setup() {
  createCanvas(720, 400);
  background(204);
  x = width / 2;
  y = height / 2;
}

function draw() {
  background(204);

  let numPoints = int(map(mouseX, 0, width, 6, 60));
  let angle = 0;
  let angleStep = 180.0 / numPoints;

  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= numPoints; i++) {
    let px = x + cos(radians(angle)) * outsideRadius;
    let py = y + sin(radians(angle)) * outsideRadius;
    angle += angleStep;
    vertex(px, py);
    px = x + cos(radians(angle)) * insideRadius;
    py = y + sin(radians(angle)) * insideRadius;
    vertex(px, py);
    angle += angleStep;
  }
  endShape();
}
```

3. Install `p5` in the same folder with the package manager of your choice:

```bash
npm install p5
```

4. Fragment use the `export` [keyword in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) to identify which functions [it should run and when](../api/sketch.md#lifecycle). Let's add them in front of `setup()` and  `draw()`.

```js
// From https://p5js.org/examples/form-triangle-strip.html

let x;
let y;
let outsideRadius = 150;
let insideRadius = 100;

export function setup() {
  createCanvas(720, 400);
  background(204);
  x = width / 2;
  y = height / 2;
}

export function draw() {
  background(204);

  let numPoints = int(map(mouseX, 0, width, 6, 60));
  let angle = 0;
  let angleStep = 180.0 / numPoints;

  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= numPoints; i++) {
    let px = x + cos(radians(angle)) * outsideRadius;
    let py = y + sin(radians(angle)) * outsideRadius;
    angle += angleStep;
    vertex(px, py);
    px = x + cos(radians(angle)) * insideRadius;
    py = y + sin(radians(angle)) * insideRadius;
    vertex(px, py);
    angle += angleStep;
  }
  endShape();
}
```

5. Fragment handles the width and height of a canvas by itself so you can remove the call to `createCanvas()` and get `width` and `height` from `setup()` arguments.

```js
// before
export function setup() {
  createCanvas(720, 400);
  background(204);
  x = width / 2;
  y = height / 2;
}

// after
export function setup({ width, height }) {
  background(204);
  x = width / 2;
  y = height / 2;
}
```

6. Fragment is running p5.js in [instance mode](https://github.com/processing/p5.js/wiki/Global-and-instance-mode) so the functions available in the global scope have to be accessed through the `p` argument in `setup()` or `draw()`.

```js
// before
export function setup({ width, height }) {
  background(204);
  x = width / 2;
  y = height / 2;
}
// after
export function setup({ p, width, height }) {
  // use p.[functionName]
  p.background(204);
  x = width / 2;
  y = height / 2;
}
```

7. Let's do it for all the p5.js functions used in the sketch:

```js
// From https://p5js.org/examples/form-triangle-strip.html

let x;
let y;
let outsideRadius = 150;
let insideRadius = 100;

export function setup({ p, width, height }) {
  p.background(204);
  x = width / 2;
  y = height / 2;
}

export function draw({ p, width, height }) {
  p.background(204);

  let numPoints = p.int(p.map(p.mouseX, 0, width, 6, 60));
  let angle = 0;
  let angleStep = 180.0 / numPoints;

  p.beginShape(p.TRIANGLE_STRIP);
  for (let i = 0; i <= numPoints; i++) {
    let px = x + p.cos(p.radians(angle)) * outsideRadius;
    let py = y + p.sin(p.radians(angle)) * outsideRadius;
    angle += angleStep;
    p.vertex(px, py);
    px = x + p.cos(p.radians(angle)) * insideRadius;
    py = y + p.sin(p.radians(angle)) * insideRadius;
    p.vertex(px, py);
    angle += angleStep;
  }
  p.endShape();
}
```

8. Great! Now let's tell Fragment that we are using p5.js. Add this line at the end of the file:

```js
export let rendering = "p5";
```

If you are using p5 in WebGL mode, you want to tell Fragment to use the P5GLRenderer instead:

```js
export let rendering = "p5-webgl";
```

9. You can now start Fragment from the command line:

```bash
fragment sketch.js
```

You should see your sketch inside Fragment interface. You can update the width and the height under the "Parameters" section.

10. Let's create a slider for the two existing variables at the top of our sketch `outsideRadius` and `insideRadius`. You can do so by adding a new export in the sketch file called `props`:

```js
export let props = {
  outsideRadius: {
    value: 150,
  },
  insideRadius: {
    value: 150,
  },
};
```

And replace the references in the code with props:

```js
// comment or remove the variable declarations
// let outsideRadius = 150;
// let insideRadius = 100;

export function draw({ p, width, height }) {
  // create new references that used the value from props instead
  let outsideRadius = props.outsideRadius.value;
  let insideRadius = props.insideRadius.value;

  p.background(204);

  let numPoints = p.int(p.map(mouseX, 0, width, 6, 60));
  let angle = 0;
  let angleStep = 180.0 / numPoints;

  p.beginShape(p.TRIANGLE_STRIP);
  for (let i = 0; i <= numPoints; i++) {
    let px = x + p.cos(p.radians(angle)) * outsideRadius;
    let py = y + p.sin(p.radians(angle)) * outsideRadius;
    angle += angleStep;
    p.vertex(px, py);
    px = x + p.cos(p.radians(angle)) * insideRadius;
    py = y + p.sin(p.radians(angle)) * insideRadius;
    p.vertex(px, py);
    angle += angleStep;
  }
  p.endShape();
}
```

You should be able to edit the values in the new available inputs under the Parameters module. 

11. Let's ask Fragment to create sliders so it's easier to play with values. On the `props` declaration, let's add a new `params` to each prop with min and max values like this:

```js
export let props = {
  outsideRadius: {
    value: 150,
    params: {
      min: 0,
      max: 200
    }
  },
  insideRadius: {
    value: 150,
    params: {
      min: 0,
      max: 200
    }
  },
};
```

You should now be able to play with sliders under the Parameters and see your changes live on the canvas.
