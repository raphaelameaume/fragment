#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → Renderers</sup>
<br>

# Renderers

#### `init`
- Type: `() => InitParams`

#### `onMountPreview`
- Type: `({ index: number, canvas: HTMLCanvasElement }) => MountParams`

#### `onBeforeUpdatePreview`
- Type: `({ index: number, canvas: HTMLCanvasElement }) => void`

#### `onAfterUpdatePreview`
- Type: `({ index: number, canvas: HTMLCanvasElement }) => void`

#### `onResizePreview`
- Type: `({ index: number, canvas: HTMLCanvasElement }) => void`

#### `onDestroyPreview`
- Type: `({ index: number, canvas: HTMLCanvasElement }) => void`

#### `resize`
- Type: `({ width: number, height: number, pixelRatio: number }) => void`
