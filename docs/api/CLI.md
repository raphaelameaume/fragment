# Command Line Interface

## Initialisation

### `fragment create`

Create a new sketch.

#### Usage

```bash
fragment create [filename]
```

#### Options

| Flag | Description |
|---|---|
|`--template, -t`| Pre-populate template choice (default: `2d`)(`string`). Check out [Templates](/docs/api/templates.md) for available options |
|`--typescript`| Pre-populate TypeScript support choice (default: `false`)(`boolean`)|

#### Example

```bash
fragment create sketch.js
```

## Development

### `fragment (run)`

Run an existing sketch.

#### Usage

```bash
fragment [filename]
fragment run [filename]
```

#### Options

| Flag |  Description |
|---|---|
|`--new, -n`| Redirect to create workflow (default: `false`)(`boolean`) |
|`--template, -t`| Pre-populate template choice in create prompts (default: `2d`)(`string`)|
|`--typescript`| Pre-populate TypeScript support choice in create prompts (default: `false`)(`boolean`)|
|`--build, -b`| Redirect to build workflow (default: `false`)(`boolean`) |
|`--development, -dev`| Run Fragment in development mode (default: `false`)(`boolean`) |
|`--outDir`| Pre-populate out directory in build prompts (default: `[/[sketch-name]`)(`string`)|
|`--emptyOutDir`| Pre-populate flag to empty outDir before static build in build prompts (default: `true`)(`boolean`)|
|`--base`| Pre-populate base public path in build prompts (default: `undefined`)(`string`) |
|`--prompts`| Toggle interactive prompts in build prompts (default: `true`)(`boolean`) |
|`--port, -p`| Specify the server port. (default: `3000`)(`number`) |
|`--open, -o`| Flag to open the application in the browser when the server starts. (default: `false`)(`boolean`) |
|`--exportDir`| Override directory used for exports (default: `undefined`)(`string`)|
|`--config`| Path to Fragment config file (default: `undefined`)(`string`) |

## Build

### `fragment build`

Build a sketch into static files for production.

#### Usage

```bash
fragment build [filename]
```

#### Options

| Flag | Description |
|---|---|
|`--development`| Run Fragment in development mode (default: `false`)(`boolean`)|
|`--outDir`| Pre-populate out directory (default: `[/[sketch-name]`)(`string`)|
|`--emptyOutDir`| Pre-populate flag to empty outDir before static build (default: `false`)(`boolean`)|
|`--base`| Pre-populate base public path (default: `undefined`)(`string`)|
|`--prompts`| Enable interactive prompts (default: `true`)(`boolean`)|

### `fragment preview`

Start a local server to preview a sketch built locally with `fragment build`.

#### Usage

```bash
fragment preview [directory]
```

## Templates

`fragment` currently has the following templates:
- [blank](../../src/cli/templates/blank)
- [2d](../../src/cli/templates/default)
- [fragment](../../src/cli/templates/fragment-gl)
- [three/fragment](../../src/cli/templates/three-fragment)
- [three/orthographic](../../src/cli/templates/three-orthographic)
- [three/perspective](../../src/cli/templates/three-perspective)
- [p5](../../src/cli/templates/p5)
- [p5-webgl](../../src/cli/templates/p5-webgl)
