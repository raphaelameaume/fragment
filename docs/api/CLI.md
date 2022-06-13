#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → CLI</sup>
<br>

# CLI

Once `fragment` is properly [installed](../../README.md#installation), you can create and launch it from the command line.

## Usage

`fragment [file] [opts]`

## Examples

```
# Start fragment with an existing sketch
fragment ./sketch.js

# Create a new file on disk and start
fragment ./sketch.js --new

# Create a new file from a pre-defined template
fragment ./sketch.js --new --template=three/orthographic
```

## Options

| Flag | Shortcut | Description | Default |
|---|---|---|
|`--new`| `-n` | Create a new file and start Fragment | `false` |
|`--template`| `-t` | Specify the type of template to use as source | `2d` |
|`--port`| `-p` | Specify the server port.  | `3000` |

## Templates

`fragment` currently supports the following templates:
- [2d](../../src/cli/templates/2d.js)
- [fragment](../../src/cli/templates/fragment.js)
- [three/fragment](../../src/cli/templates/three-fragment.js)
- [three/orthographic](../../src/cli/templates/three-orthographic.js)
- [three/perspective](../../src/cli/templates/three-perspective.js)
- [p5](../../src/cli/templates/p5.js)
