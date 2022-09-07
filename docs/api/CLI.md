#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → CLI</sup>

<br>

# CLI

Once `fragment` is properly [installed](../../README.md#installation), you can launch it and create sketches from the command line.

## Usage

`fragment [file|folder] [opts]`

## Examples

```sh
# Start fragment with an existing sketch
fragment ./sketch.js

# Create a new file on disk and start
fragment ./sketch.js --new

# Create a new file from a pre-defined template
fragment ./sketch.js --new --template=three/orthographic
```

### With TypeScript

```sh
# Start fragment with an existing sketch
fragment ./sketch.ts

# Create a new file on disk and start
fragment ./sketch.ts --new

# Create a new file from a pre-defined template
fragment ./sketch.ts --new --template=three/orthographic-ts
```

## Options

| Flag            | Shortcut | Description                                   | Default           |
| --------------- | -------- | --------------------------------------------- | ----------------- |
| `--new`         | `-n`     | Create a new file and start                   | `false`           |
| `--template`    | `-t`     | Specify the type of template to use as source | `2d`              |
| `--port`        | `-p`     | Specify the server port.                      | `3000`            |
| `--build`       | `-b`     | Build sketch for production                   | `false`           |
| `--outDir`      | `none`   | Change directory used for production build    | `[/[sketch-name]` |
| `--emptyOutDir` | `none`   | Empty outDir before static build              | `false`           |

## Templates

`fragment` currently supports the following templates:

| JavaScript                                                          | TypeScript                                                             |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [2d](../../src/cli/templates/2d.js)                                 | [2d-ts](../../src/cli/templates/2d.ts)                                 |
| [fragment](../../src/cli/templates/fragment.js)                     | [fragment-ts](../../src/cli/templates/fragment.ts)                     |
| [three/fragment](../../src/cli/templates/three-fragment.js)         | [three/fragment-ts](../../src/cli/templates/three-fragment.ts)         |
| [three/orthographic](../../src/cli/templates/three-orthographic.js) | [three/orthographic-ts](../../src/cli/templates/three-orthographic.ts) |
| [three/perspective](../../src/cli/templates/three-perspective.js)   | [three/perspective-ts](../../src/cli/templates/three-perspective.ts)   |
| [p5](../../src/cli/templates/p5.js)                                 | [p5-ts](../../src/cli/templates/p5.ts)                                 |
