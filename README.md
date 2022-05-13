# Fragment

`fragment` is a live environment to build reactive A/V experiments directly in the browser. It provides a simple API to work with Canvas 2D or WebGL (only THREE.js is currently supported).

## Installation

As `fragment` is not yet available on npmjs.org, you need to clone and link the project in order to use. It's only a few steps.

```
git clone https://github.com/raphaelameaume/fragment`
cd fragment
npm link
``` 

You should now be able to run the CLI in the folder with npm initialized. If you have issues while linking, I invite you to read the npm link documentation.

Let's create a new directory for your sketches.

```
cd ../
mkdir sketches
cd sketches
npm init
```

You should now be able to run `fragment` at the root of your directory.

## Usage

## Motivation

This project started a few years ago.

## Contributing

If you find issues, please file one with details on how to reproduce it.

As for new features, I'm not looking into contributors for now, I'm moving at my own pace on this personal project.

## Credits

- [Vite.js](https://vitejs.dev/)
- [Svelte](https://svelte.dev/)
- The font used for display is the [JetBrains Mono](https://www.jetbrains.com/lp/mono/).
- A special thanks to [Matt Deslauriers](https://www.mattdesl.com/) for [canvas-sketch](https://github.com/mattdesl/canvas-sketch) and his multiple projects around generative-art tools.
