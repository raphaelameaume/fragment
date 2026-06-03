<h1 align="center">Fragment</h1>
<div align="center">A modern toolkit for creative coding</div>
<br/>

Fragment lets you sketch, render, and export canvas-based graphics with ease, from quick experiments to production-ready visuals.

![Screen capture of Fragment, splitted in two columns, the left one has a canvas displaying circles arranged in a grid layout with chromatic aberration, grain and blur effects. The right column contains various controls for colors, circle and grid parameters and an export module with video capabilities](https://github.com/raphaelameaume/fragment/blob/dev/screenshot.jpg?raw=true 'Screen Capture of Fragment')


## Features

- Start instantly using built-in templates for [Canvas 2D](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), [p5.js](https://github.com/processing/p5.js/), and [three.js](https://github.com/mrdoob/three.js/)
- Generate live GUI controls directly from your sketch parameters
- Reload GLSL shaders on the fly
- Attach mouse, keyboard, and MIDI inputs directly from the interface or your code
- Organize your creative workspace with flexible window layouts
- Export your sketches as images or videos in standard formats
- Build static bundles ready for production deployment

## Specifications

- Fast development and production builds powered by [Vite](https://vite.dev/)
- Interactive command-line interface on top of [sade](https://github.com/lukeed/sade) and [clack](https://www.clack.cc/)
- Video encoding in the browser with [Mediabunny](https://mediabunny.dev/)
- TypeScript support

## Installation

### With `npx`

```bash
npx fragment-tools sketch.js --new
```

### Installing globally with `--global`

```bash
npm install fragment-tools --global
```

You should now be able to run `fragment` from your command line.

```bash
fragment -v
```

### Installing locally

```bash
npm install fragment-tools
```

## Usage

```bash
# Create a new directory for your sketches
mkdir sketches

# Move into that folder
cd sketches

# Create a sketch from a template
npx fragment sketch.js --new --template=2d

# or with TypeScript
npx fragment sketch.ts --new --template=2d --typescript

## Run an existing sketch
npx fragment sketch.js
```

Learn more about the available flag options in the [CLI docs](./docs/api/CLI.md).

## Example

This is an example of a sketch drawing a blue circle on a black background with a custom control for the radius of the circle.

```js
export let props = {
	background: {
		value: '#0057B8', // create a color input GUI
	},
	fill: {
		value: 'rgba(255, 215, 0, 1)', // create a color input GUI
	},
	size: {
		value: 256, // create a number input GUI
		params: {
			min: 64, // add a range slider
			max: 512,
		},
	},
	shape: {
		value: 'circle', // create a string input
		params: {
			options: ['circle', 'square'], // turns the input into a select with different options
		},
	},
};

export let update = ({ context, width, height, pixelRatio }) => {
	// draw background
	context.fillStyle = props.background.value;

	const w = width * pixelRatio;
	const h = height * pixelRatio;

	context.fillRect(0, 0, w, h);

	// draw circle
	const shape = props.shape.value;
	const size = props.size.value * pixelRatio;

	context.fillStyle = props.fill.value;

	if (shape === 'circle') {
		context.beginPath();
		context.arc(w * 0.5, h * 0.5, size, 0, 2 * Math.PI, false);
		context.fill();
	} else if (shape === 'square') {
		context.fillRect(w * 0.5 - size, h * 0.5 - size, size * 2, size * 2);
	}
};

export let rendering = '2d';
export let fps = 0;
export let name = 'Canvas2D Shape Example';
export let buildConfig = {
	resizing: 'window',
};
```

Learn how to write your own sketch by following the [Getting started](./docs/introduction/getting-started.md) guide, reading the [API docs](./docs/api/sketch.md) or the other [examples](./examples/).

## Contributing

If you find issues, please [file one](https://github.com/raphaelameaume/fragment/issues) with details on how to reproduce it.

Feel free to reach out on [Bluesky](https://bsky.app/profile/raphaelameaume.com) if you want to discuss the project.

## Running it locally

```bash
# Clone or fork the project
git clone https://github.com/raphaelameaume/fragment.git

# Move to the root of the repository
cd fragment

# Run the command line locally
node ./bin/index.js examples/shape-2d.js --dev

# or from your sketch folder
node [path-to-root]/bin/index.js sketch.js --dev
```

> The `--dev` flag only enables Vite `info` logLevel, helpful for development. Otherwise it will work the same as when you're running from the npm package.

Alternatively, you can tell npm to point the `fragment` command to the newly cloned folder.

```
# at the root of the repo
npm link
```

You should be able the command as before, only this time it will point to the repository instead of the globally installed package.

```bash
fragment sketch.js
```

If that's not the case, try to uninstall `fragment-tools` globally first, make sure the `fragment` command is not found anymore, then retry to link the project from the root of the repo.

## Credits

- [Vite](https://vitejs.dev/)
- [Svelte](https://svelte.dev/)
- The font used for display is the [JetBrains Mono](https://www.jetbrains.com/lp/mono/).
- Icons are from [Iconic](https://iconic.app/)
- A special thanks to [Matt Deslauriers](https://www.mattdesl.com/) for [canvas-sketch](https://github.com/mattdesl/canvas-sketch) and his multiple projects around generative-art tools.

## License

See [LICENSE.md](./LICENSE.md) for details.
