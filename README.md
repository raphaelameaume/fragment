<h1 align="center">Fragment</h1>
<div align="center">A web development environment for creative coding</div>
<br/>

![Screen capture of Fragment, splitted in two columns, the left one has a centered canvas displaying squares arranged in a grid, the right column contains various controls for colors, variables and exports](https://github.com/raphaelameaume/fragment/raw/main/screenshot.png "Screen Capture of Fragment")

`fragment` provides a simple API to work with `<canvas>`.

## Features

- Multiple rendering modes: [Canvas 2D](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), [p5.js](https://github.com/processing/p5.js/), [three.js](https://github.com/mrdoob/three.js/), [WebGL fragment shaders](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader)
- Built-in GUI from sketch files
- Export `<canvas>` to images (.png, .webm, .jpg) or videos (.mp4, .webm, .gif) on the fly
- Hot shader reloading & [glslify](https://github.com/glslify/glslify) support
- Interactive sketches using *triggers*
- Static build for production deployment

## Installation

```
npm install fragment-tools -g
``` 

You should now be able to run `fragment` from your command line.

## Usage

```
# create a new directory for your sketches
mkdir sketches

# move into that folder
cd sketches

# create a sketch from a template
fragment ./sketch.js --new --template=2d
```

Learn more about the available flag options in the [CLI docs](./docs/api/CLI.md).

## Example

This is an example of a sketch drawing a blue circle on a black background with a custom control for the radius of the circle.

```js
export let props = {
  radius: {
    value: 10,
    params: {
      min: 4,
      max: 30
    }
  }
};

export let update = ({ context, width, height }) => {
  // draw background
  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  // draw circle
  const radius = props.radius.value;

  context.fillStyle = '#0000ff';
  context.beginPath();
  context.arc(width * 0.5, height * 0.5, radius, 0, 2 * Math.PI, false);
  context.fill();
};
```

Learn how to write your own sketch by following the [Getting started](./docs//guide/getting-started.md) guide, reading the [API docs](./docs/api/sketch.md) or the [examples](./examples/).

## Contributing

If you find issues, please [file one](https://github.com/raphaelameaume/fragment/issues) with details on how to reproduce it.

Feel free to reach out on [Twitter](https://twitter.com/raphaelameaume) if you want to discuss the project.

## Running it locally

```
# clone or fork the project
git clone https://github.com/raphaelameaume/fragment.git 

# move to the root of the repository
cd fragment

# run the command line locally
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

```
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
