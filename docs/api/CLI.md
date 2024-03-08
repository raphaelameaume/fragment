#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → CLI</sup>
<br>

# CLI

Once `fragment` is properly [installed](../../README.md#installation), you can launch it and create sketches from the command line.

## Usage

### Create

Create a new sketch.

```bash
fragment create [filename]
```

#### Options

| Flag | Shortcut | Description | Default |
|---|---|---|---|
|`--template`| `-t` | Prepopulate template choice | `2d` |

#### Example

```bash
fragment create sketch.js
```

### Run

Run an existing sketch.

```bash
fragment run [filename]
```
The command `run` can be omitted since it's the default command

```bash
fragment [filename]
```

#### Options

| Flag | Shortcut | Description | Default |
|---|---|---|---|
|`--port`| `-p` | Specify the server port.  | `3000` |
|`--exportDir`| none | Override directory used for exports  | `undefined` |
|`--new`| `-n` | Redirect to create prompts | `false` |
|`--template`| `-t` | Pre-populate template choice in create prompts | `2d` |
|`--build`| `-b` | Redirect to build prompts  | `false` |
|`--outDir`| none | Pre-populate outDir in build prompts  | `[/[sketch-name]` |
|`--emptyOutDir`| none | Pre-populate emptyOutDir in build prompts  | `false` |
|`--base`| none | Pre-populate base path in build prompts | `undefined` |
|`--development`| none | Run Fragment in development mode  | `false` |

### Build

Build a sketch into static files for production.

```bash
fragment build [filename]
```

#### Options

| Flag | Shortcut | Description | Default |
|---|---|---|---|
|`--outDir`| none | Pre-populate out directory  | `[/[sketch-name]` |
|`--emptyOutDir`| none | Empty outDir before static build  | `false` |
|`--base`| none | Base public path when served in production  | `undefined` |
|`--development`| none | Run Fragment in development mode  | `false` |

### Preview

Start a local server to preview a sketch built locally with `fragment build`.

```bash
fragment preview [directory]
```

## Templates

`fragment` currently has the following templates:
- [blank](../../src/cli/templates/blank/index.js)
- [2d](../../src/cli/templates/default/index.js)
- [fragment](../../src/cli/templates/fragment-gl/index.js)
- [three/fragment](../../src/cli/templates/three-fragment/index.js)
- [three/orthographic](../../src/cli/templates/three-orthographic/index.js)
- [three/perspective](../../src/cli/templates/three-perspective/index.js)
- [p5](../../src/cli/templates/p5/index.js)
- [p5-webgl](../../src/cli/templates/p5-webgl/index.js)
