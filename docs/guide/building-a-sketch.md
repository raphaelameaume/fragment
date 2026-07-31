# Building a sketch

A sketch can be compiled into standalone static files (HTML, JavaScript, and CSS), making it suitable for deployment on any web server or hosting platform.

```bash
fragment build [filename]
```

Additional configuration options are documented in the [CLI reference](../api/CLI.md#build).

## Previewing a build

While in development, pressing `p` will open a preview that displays a version of the sketch as it will appear once built. While in this mode, changes made to the `buildConfig` object are hot-reloaded, allowing adjustments to layout, colors, dimensions, GUI settings, and styling to be seen immediately without rebuilding each time. This makes it possible to fine-tune the final presentation of the exported sketch while still working in the development environment.

## Automated builds

By default, the `fragment build` command opens interactive prompts to choose the output destination and other build settings. This is convenient during manual development, but not suitable for automated environments such as Netlify, Vercel, or GitHub Actions.

For Continuous Integration workflows, prompts can be disabled using:

```bash
fragment build --prompts=false
```

When prompts are disabled, all required choices must be provided through CLI flags. This allows the build to run without user interaction, making it appropriate for deployment pipelines and automated exports triggered by commits or build hooks.

Refer to the [CLI documentation](../api/CLI.md#build) for the full list of available flags that can replace interactive selections.

## Build configuration

Build behavior can be customized directly from the sketch by exporting a `buildConfig` object. This makes it possible to adjust visual appearance, layout, rendering dimensions, and GUI behaviour.

```js
// sketch.js
export let buildConfig = {
	backgroundColor: "red",
	dimensions: [256, 256],
	gui: {
		position: "float",
		align: "left",
		size: 0.4,
		output: false,
	},
  	styles: /* css */`
		:root {
			--color-active: red;
		}

		canvas {
			box-shadow: 0px 2px 12px -2px rgba(0, 0, 0, 0.35);
		}
	}`
};
```

| name | type | effect | default |
|---|---|---|---|
| `backgroundColor` | `string` | Change the background color when canvas is not full size | `inherit` |
| `dimensions` | `number[2]` | Change the dimensions of the canvas | Viewport size |
| `canvasSize`| `string` | Change the resizing method of the canvas. Can be `window`, `fixed`, `scale`, `preset`, `aspect-ratio` | `window` |
| `pixelRatio` | `number\|function` | Change the pixel ratio of the canvas. | `1` |
| `layout` | `object` | Change the layout options | `{}` |
| `layout.resizable` | `boolean` | Enable resizing of the modules | `true` |
| `layout.headless` | `boolean` | Hide modules headers | `false` |
| `layout.persistent` | `boolean` | Preserve resizing between reloads | `false` |
| `layout.component` | `SvelteComponent` | Swap the BuildLayout component | `undefined` |
| `gui` | `boolean\|object` | Display gui | `false` |
| `gui.position` | `string` | Change gui appearance. Can be `fixed` or `float` | `float` |
| `gui.align` | `string` | Change gui position. Can be `left` or `right` | `right` |
| `gui.size` | `string\|number` | Change gui width. Can be a percentage or a number between 0 and 1 | `0.3`
| `gui.output` | `string\|number` | Display canvasSize and dimensions fields in gui | `false` |
| `gui.hidden` | `boolean` | Hide gui on start | `false` |
| `styles` | `string` | Inject styles in document | `false` |
