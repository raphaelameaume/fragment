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
|`--template, -t`| Pre-populate template choice (default: `2d`)(`string`) |
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
|`--port, -p`| Specify the server port. (default: `3000`)(`number`) |
|`--exportDir`| Override directory used for exports (default: `undefined`)(`string`)|
|`--new, -n`| Redirect to create workflow (default: `false`)(`boolean`) |
|`--template, -t`| Pre-populate template choice in create prompts (default: `2d`)(`string`)|
|`--build, -b`| Redirect to build workflow (default: `false`)(`boolean`) |
|`--outDir`| Pre-populate outDir in build prompts  (default: `[/[sketch-name]`)(`string`)|
|`--emptyOutDir`| Pre-populate emptyOutDir in build prompts (default: `false`)(`boolean`)|
|`--base`| Pre-populate base path in build prompts (default: `undefined`)(`string`) |
|`--development`| Run Fragment in development mode (default: `false`)(`boolean`) |
|`--prompts`| Toggle interactive prompts in build prompts (default: `true`)(`boolean`) |

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
|`--outDir`| Pre-populate out directory (default: `[/[sketch-name]`)(`string`)|
|`--emptyOutDir`| Empty outDir before static build (default: `false`)(`boolean`)|
|`--base`| Base public path when served in production (default: `undefined`)(`string`)|
|`--development`| Run Fragment in development mode (default: `false`)(`boolean`)|
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
