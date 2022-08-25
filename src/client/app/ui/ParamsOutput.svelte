<script>
import { rendering, SIZES, monitors } from "../stores/rendering.js";
import { sketchesCount } from "@fragment/props";
import Field from "./Field.svelte";
import presets, { getDimensionsForPreset } from "../lib/presets";
import { exports } from "../stores";
import ParamsMultisampling from "./ParamsMultisampling.svelte";

let canvasWidth = $rendering.width;
let canvasHeight = $rendering.height;

function handleChangeDimensions(event) {
    const [width, height] = event.detail;
    const needsUpdate = canvasWidth !== width || canvasHeight !== height;

    if (needsUpdate) {
        canvasWidth = width;
        canvasHeight = height;

        rendering.update((curr) => {
            return {
                ...curr,
                width,
                height
            }
        });
    }
}

let sizes = Object.values(SIZES);
$: dimensionsEnabled = [SIZES.FIXED, SIZES.SCALE].includes($rendering.resizing);

$: {
    if ($rendering.resizing === SIZES.PRESET) {
        const { preset } = $rendering;
        const [ width, height ] = getDimensionsForPreset(preset, { pixelsPerInch: 300 });

        rendering.update((curr) => {
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
        $rendering.width,
        $rendering.height,
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
    value={$rendering.resizing}
    on:change={(event) => {
        const resizing = event.currentTarget.value;
        let aspectRatio = 1;

        if (resizing === SIZES.ASPECT_RATIO) {
            // compute aspect ratio based on previous props
            aspectRatio = $rendering.width / $rendering.height;
        }

        $exports.pixelsPerInch = resizing === SIZES.PRESET ? 300 : 72;

        rendering.update((curr) => {
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
{#if $rendering.resizing === SIZES.ASPECT_RATIO}
<Field
    key="aspectRatio"
    value={$rendering.aspectRatio}
    on:change={(event) => {
        $rendering.aspectRatio = event.detail;
    }}
    params={{
        step: 0.01,
    }}
/>
{/if}
{#if $rendering.resizing === SIZES.SCALE}
<Field
    key="zoom"
    value={$rendering.scale}
    on:change={(event) => {
        $rendering.scale = event.detail;
    }}
    params={{
        step: 0.01,
    }}
/>
{/if}
{#if $rendering.resizing === SIZES.PRESET}
<Field
    key="preset"
    value={$rendering.preset}
    on:change={(event) => {
        $rendering.preset = event.detail;
    }}
    params={{
        options: presets,
    }}
/>
{/if}

{#if $rendering.resizing !== SIZES.PRESET }
<Field
    key="pixelRatio"
    value={Number($rendering.pixelRatio)}
    on:change={(event) => $rendering.pixelRatio = event.detail }
    params={{
        step: 0.1,
    }}
/>
{/if}
{#if sketchesCount > 1 && $monitors.length > 1 }
<ParamsMultisampling />
{/if}
