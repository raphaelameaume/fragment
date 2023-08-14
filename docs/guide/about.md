#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → About</sup>
<br>

# About

`fragment` started as an idea in 2017 when I did a VJ performance based on [three.js](https://threejs.org/) visuals with a friend. We had a couple of different scenes that could react to audio beats and MIDI inputs. All scenes were made at different times, with different stacks and MIDI inputs had to be programmed and reminded beforehand.

In 2018, we did a projection mapping for MAPP Montreal, also made with [three.js](https://threejs.org/). Visuals were still reacting to the soundtrack but it was not live, we needed to export a video of the whole thing. As we were lacking time to find better solutions, we ended up using a computer capable of capturing the screen while still rendering at 60fps. Not ideal.

In 2019, I became a freelance creative developer and extended the variety of my practices: web development, real-time graphics, and generative art. I felt the need of a sketching environment, who could support the range of needs of my previous and future projects:
- programmable interface
- reactive to different kinds of inputs (GUIS, keyboard, MIDI, mouse, sound...) from the code and the UI
- fast as possible
- images, videos or live exports

So I spent the last 3 years building my own tool.

## Principles 

### Local-first 

`fragment` should work without an internet connection, so no requests can be made to load fonts, styles or scripts.

### Independence

`fragment` tries to keep the dependencies count low, first to avoid relying on too many outside actors and factors, and two because building things by ourselves is an opportunity to learn something new.  
Adding a new dependency should therefore be carefully considered before doing so.

### Freedom

One of the core principles of `fragment` is to avoid being dependent of the tool itself while writing code, so a sketch can be used in other environments without the need to install it as long as you don't rely on its hooks or helpers. 

You could have your own way of building a sketch by importing a sketch and replicating the missing pieces of a renderer.

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
