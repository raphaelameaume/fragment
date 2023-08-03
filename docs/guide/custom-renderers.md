#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Custom renderers</sup>
<br>

# Custom renderers

`fragment` has built-in support for [Canvas 2D](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), [p5.js](https://github.com/processing/p5.js/), [three.js](https://github.com/mrdoob/three.js/) and [WebGL fragment shaders](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader), however you might want to implement your own renderer.

You can do so by exporting a `renderer` from the sketch file like so:

```js
import * as SVGRenderer from './custom-svg-renderer.js';

export let renderer = SVGRenderer;
```

Dynamic imports are also supported by wrapping the import in a `function`.

```js
export let renderer = () => import('./SVGRenderer');
```

> ⚠️ Do not mistake `renderer` and `rendering`. The `rendering` export is just a string key used internally by Fragment for retrieving and caching the built-in renderers. The key is not needed when using a custom renderer as it's simply not cached.

## Implementation

Renderers have their own lifecycle inside `fragment`, that can be defined through ESM named-exports just like in a sketch file. 
You can refer to the [Renderers](../api/renderers.md) API that list available exports and their usage.

## Example

```js
// custom-svg-renderer
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
export let renderer = () => import('./custom-svg-renderer.js');

export let update = ({ svg, width, height }) => {
	// use the tag function exposed by the renderer in `onMountPreview`
	svg`
<circle cx="${width * 0.5}" height="${height * 0.5}" r="50" fill="red" />	
`
};

```

> ⚠️ In this example, nothing is drawn on the canvas, so the different exports (images or videos) will not work (the files will be blank). You might want to implement your own way of replicating the SVG (in this special case) to the canvas by parsing it and drawing it with a 2D context in `onAfterUpdatePreview`. 
