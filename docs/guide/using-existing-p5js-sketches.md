# Using existing p5.js sketches

Existing sketches can be brought into Fragment with a few small changes, making it possible to benefit from features such as video and image exports, triggering functions via MIDI input, or deploying sketches online.

1. Install Fragment following the [Installation](../../README.md#installation) instructions
2. Create a new JavaScript file and paste the code from the existing sketch. For example:

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

3. Install `p5` in the same folder using any preferred package manager:

```bash
npm install p5
```

4. Fragment detects lifecycle functions based on the [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) keyword in JavaScript. Add it in front of setup() and draw():

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

5. Fragment manages the canvas dimensions automatically. Remove the call to `createCanvas()` and get `width` and `height` from `setup()` arguments.

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

6. Fragment runs p5.js in [instance mode](https://github.com/processing/p5.js/wiki/Global-and-instance-mode). Global p5 functions must therefore be accessed via the `p` argument:

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

7. Apply this approach across the entire sketch:

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

8. Finally, notify Fragment that p5.js is being used by adding at the end of the file:

```js
export let rendering = "p5";
```

For WebGL mode:

```js
export let rendering = "p5-webgl";
```

9. Launch Fragment:

```bash
fragment sketch.js
```

The sketch should now appear inside the Fragment interface, with editable width and height parameters.

10. To add user-adjustable sliders for `outsideRadius` and `insideRadius`, declare `props`:

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

Then update the sketch to reference these values:

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

11. To create sliders with defined ranges, add `params`:

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

Sliders will now appear in the Parameters panel, allowing live interaction with the sketch's behavior.
