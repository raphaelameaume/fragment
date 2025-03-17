# Overview

## Principles

### Local-first

Fragment should work without an internet connection, so no external requests can be made to load fonts, styles or scripts.

### Independence

Fragment tries to keep the dependencies count low, first to avoid relying on too many outside actors and factors, and second because building things by ourselves is an opportunity to learn something new.
Adding a new dependency should therefore be carefully considered before doing so.

### Credible exit

One of the core principles of Fragment is to avoid being dependent of the tool itself while writing code, so a sketch can be used in other environments without the need to install it as long as you don't rely on its hooks or helpers.

This way, Fragment offers a [credible exit](https://newsletter.squishy.computer/p/credible-exit).

You could have your own way of building a sketch by importing the module as a whole and replicating the missing pieces of a Renderer.

```js
// custom-build.js

import * as sketch from './sketch.js';

let canvas = document.createElement('canvas');

let width = window.innerWidth;
let height = window.innerHeight;
let pixelRatio = window.devicePixelRatio;

sketch.init({ canvas });
sketch.resize({ width, height, pixelRatio });

function update() {
	sketch.update();
	requestAnimationFrame(update);
}

requestAnimationFrame(update);

window.addEventListener('resize', () => {
	sketch.resize({
		width: window.innerWidth,
		height: window.innerHeight,
		pixelRatio: window.devicePixelRatio,
	})
})
```
