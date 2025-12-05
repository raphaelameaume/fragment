# Custom renderers

Fragment has built-in support for [Canvas 2D](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), [p5.js](https://github.com/processing/p5.js/), [three.js](https://github.com/mrdoob/three.js/) and [WebGL fragment shaders](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader). Custom renderers can also be implemented when a different rendering strategy is required.

A custom renderer can be assigned by exporting a `renderer` property from a sketch file:

```js
import * as SVGRenderer from "/path/to/custom-svg-renderer.js";

export let renderer = SVGRenderer;
```

Dynamic imports are also supported by wrapping the import in a `function`.

```js
export let renderer = () => import("path/to/custom-svg-renderer.js");
```

> `renderer` should not be confused with `rendering`. The `rendering` export is a string key used internally by Fragment to retrieve and cache built-in renderers, and is not needed when using a custom renderer.

## Implementation

Renderers have their own lifecycle inside `fragment`, that can be defined through ESM named-exports just like in a sketch file. The [Renderers API](../api/renderers.md) documents available lifecycle functions and their expected structure.

## Example

```js
// custom-svg-renderer.js
let previews = [];

export let onMountPreview = ({ id, container, width, height }) => {
	const element = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'svg',
	);
	element.setAttribute('id', `svg_${id}`);

	const preview = {
		id,
		strings: [],
		values: [],
		svg: element,
	};

	// place element on top of existing canvas
	element.style.cssText = `
position: absolute;
max-width: 100%;
max-height: 100%;
flex: none;
width: auto !important;
height: auto !important;
background-color: var(--background-color, #000000);
`;

	// append svg right after existing canvas, layering it on top of it
	container.appendChild(element);

	// create a tag function to improve svg readability when writing
	const svg = (strings, ...values) => {
		preview.strings = strings;
		preview.values = values;
	};
	previews.push(preview);

	return {
		svg, // return the tag function, later exposed to sketch hooks
	};
};

export let onAfterUpdatePreview = ({
	id,
	canvas,
	width,
	height,
	pixelRatio,
}) => {
	const preview = previews.find((p) => p.id === id);
	const { svg, context, strings, values } = preview;
	const html = String.raw({ raw: strings }, ...values);

	svg.innerHTML = html;
};

export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((p) => p.id === id);
	const preview = previews[previewIndex];

	preview.svg.parentNode.removeChild(preview.svg);

	previews.splice(previewIndex, 1);
};

export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	const preview = previews.find((p) => p.id === id);
	const { svg } = preview;

	const w = width * pixelRatio;
	const h = height * pixelRatio;
	svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
	svg.setAttribute('width', w);
	svg.setAttribute('height', h);
};

```

```js
// sketch
export let renderer = () => import("path/to/custom-svg-renderer.js");

export let update = ({ svg, width, height }) => {
	// use the tag function exposed by the renderer in `onMountPreview`
	svg`
<circle cx="${width * 0.5}" height="${height * 0.5}" r="50" fill="red" />
`
};

```

> In this example, nothing is drawn directly to the canvas, meaning built-in exports such as image or video output will produce blank files. To make these exports work, the SVG content can be manually drawn onto the canvas inside `onAfterUpdatePreview`.
