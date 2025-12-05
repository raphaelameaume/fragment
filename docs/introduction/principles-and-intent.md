# Principles & Intent


Fragment exists to make digital sketching, experimentation, and visual exploration fast, intuitive, and empowering. The tool should:
- encourage creative iteration without friction
- remain understandable and transparent rather than magical or opaque
- support workflows that can scale from small experiments to production work
- enable learning, rather than abstract it away
- allow artists and developers to stay close to the technologies they are using

Fragment supports the creative process without locking the work into its ecosystem.

Its design principles prioritize openness, longevity, and creative independence.

## Local-first

Fragment is designed to run fully offline. No network access is required to load fonts, scripts, styles, or other assets.

This ensures that:
- Sketches always run the same, with or without internet access.
- No external services can break your workflow.
- Projects remain portable and self-contained.

## Independence

Fragment aims to keep external dependencies to a minimum. This serves two goals:
1. **Self-reliance and control** - fewer external libraries means fewer external points of failure, less supply chain risk, and lower maintenance overhead.
2. **Learning and understanding** - implementing features internally provides opportunities to explore, experiment, and improve as Fragment evolves.

## Credible exit

Fragment encourages writing sketches that can survive outside of Fragment itself.

A sketch should remain usable in another environment as long as it does not rely on Fragment-specific hooks or helpers. This avoids lock-in and ensures:
- Code remains your own.
- Nothing prevents you from exporting, adapting, or running it elsewhere later.
- Fragment remains a tool - not a boundary.

This aligns with the idea of a [credible exit](https://newsletter.squishy.computer/p/credible-exit): the freedom to leave without losing the work you've created.

For example, a sketch can be manually assembled into a small standalone animation loop without using Fragment at all:

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
