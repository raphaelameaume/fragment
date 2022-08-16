<script>
import { current as currentRendering, SIZES, monitors } from "../stores/rendering.js";
import { sketchesCount } from "@fragment/props";
import Field from "./Field.svelte";
import presets, { getDimensionsForPreset } from "../lib/presets";
import { exports } from "../stores";
import ParamsMultisampling from "./ParamsMultisampling.svelte";

let canvasWidth = $currentRendering.width;
let canvasHeight = $currentRendering.height;

function handleChangeDimensions(event) {
    const [width, height] = event.detail;
    const needsUpdate = canvasWidth !== width || canvasHeight !== height;

    if (needsUpdate) {
        canvasWidth = width;
        canvasHeight = height;

        currentRendering.update((curr) => {
            return {
                ...curr,
                width,
                height
            }
        });
    }
}

let sizes = Object.values(SIZES);
$: dimensionsEnabled = [SIZES.FIXED, SIZES.SCALE].includes($currentRendering.resizing);

$: {
    if ($currentRendering.resizing === SIZES.PRESET) {
        const { preset } = $currentRendering;
        const [ width, height ] = getDimensionsForPreset(preset, { pixelsPerInch: 300 });

        currentRendering.update((curr) => {
            return {
                ...curr,
                width,
                height,
            };
        });
    }
}

</script>

<Field
    key="dimensions"
    value={[
        $currentRendering.width,
        $currentRendering.height,
    ]}
    on:change={handleChangeDimensions}
    params={{
        step: 1,
        suffix: "px",
        locked: false,
        disabled: !dimensionsEnabled,
    }}
/>
<Field
    key="canvasSize"
    value={$currentRendering.resizing}
    on:change={(event) => {
        const resizing = event.detail;
        let aspectRatio = 1;

        if (resizing === SIZES.ASPECT_RATIO) {
            // compute aspect ratio based on previous props
            aspectRatio = $currentRendering.width / $currentRendering.height;
        }

        $exports.pixelsPerInch = resizing === SIZES.PRESET ? 300 : 72;

        currentRendering.update((curr) => {
            return {
                ...curr,
                resizing,
                aspectRatio,
            }
        });
    }}
    params={{
        options: sizes,
    }}
/>
{#if $currentRendering.resizing === SIZES.ASPECT_RATIO}
<Field
    key="aspectRatio"
    value={$currentRendering.aspectRatio}
    on:change={(event) => {
        $currentRendering.aspectRatio = event.detail;
    }}
    params={{
        step: 0.01,
    }}
/>
{/if}
{#if $currentRendering.resizing === SIZES.SCALE}
<Field
    key="zoom"
    value={$currentRendering.scale}
    on:change={(event) => {
        $currentRendering.scale = event.detail;
    }}
    params={{
        step: 0.01,
    }}
/>
{/if}
{#if $currentRendering.resizing === SIZES.PRESET}
<Field
    key="preset"
    value={$currentRendering.preset}
    on:change={(event) => {
        $currentRendering.preset = event.detail;
    }}
    params={{
        options: presets,
    }}
/>
{/if}

{#if $currentRendering.resizing !== SIZES.PRESET }
<Field
    key="pixelRatio"
    value={$currentRendering.pixelRatio}
    on:change={(event) => $currentRendering.pixelRatio = event.detail }
    params={{
        step: 0.1,
    }}
/>
{/if}
{#if sketchesCount > 1 && $monitors.length > 1 }
<ParamsMultisampling />
{/if}
