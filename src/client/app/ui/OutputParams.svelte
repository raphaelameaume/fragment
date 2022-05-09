<script>
import { emit, TRANSITION_CHANGE } from "../events";
import { current as currentRendering, canvases, SIZES, threshold, multisampling, monitors } from "../stores/rendering.js";
import { sketchesCount } from "@fragment/props";
import Field from "./Field.svelte";
import FieldGroup from "./FieldGroup.svelte";
import { transitions } from "../transitions/index.js";
import presets, { getDimensionsForPreset } from "../lib/presets";
import { client } from "../client";

let canvasWidth = $currentRendering.width;
let canvasHeight = $currentRendering.height;

let monitorDisabled = false;
let sampler0 = -1;
let sampler1 = -1;

$: samplerOptions = $canvases
    .filter(c => c._index !== undefined)
    .sort((a, b) => (a._index < b._index) ? -1 : 1)
    .map((c, index) => {
        return { label: `monitor ${c._index}`, value: c._index }
    });
$: {
    monitorDisabled = samplerOptions.length === 0;

    if (samplerOptions.length === 0) {
        samplerOptions = [
            { label: `No monitor available.`, value: -1 }
        ];
        sampler0 = samplerOptions[0].value;
        sampler1 = samplerOptions[0].value;
    } else {
        if (sampler0 < 0) {
            sampler0 = samplerOptions[0].value;
        }

        if (sampler1 < 0) {
            sampler1 = samplerOptions.length > 1 ? samplerOptions[1].value : -1;
        }
    }

    $multisampling = [sampler0, sampler1];
}

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

function handleChangeSamplers() {
    $multisampling = [sampler0, sampler1];
}

multisampling.subscribe(() => {
    let m0 = $monitors.find(m => m.index === sampler0);
    let m1 = $monitors.find(m => m.index === sampler1);

    if (m0 && m1) {
        client.emit('save', {
            key: 'output',
            value: {
                sampler0: m0.selected,
                sampler1: m1.selected,
            }
        });
    }

});

let transition = $threshold;

let transitionOptions = Object.keys(transitions).map((key) => {
    const transition = transitions[key];
    const label = transition.name ? transition.name : key;
    return { value: key, label };
});

function handleChangeTransition(event) {
    transition = event.detail;
    $currentRendering.transition = transition;

    emit(TRANSITION_CHANGE, transitions[transition]);
}

let sizes = Object.values(SIZES);
$: dimensionsEnabled = $currentRendering.resizing === "fixed";

$: {
    if ($currentRendering.resizing === SIZES.PRESET) {
        const { preset, pixelsPerInch } = $currentRendering;
        const [ width, height ] = getDimensionsForPreset(preset, { pixelsPerInch });

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
{#if $currentRendering.resizing === "aspect-ratio"}
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
<Field
    key="pixelsPerInch"
    value={$currentRendering.pixelsPerInch}
    on:change={(event) => {
        $currentRendering.pixelsPerInch = event.detail;
    }}
    params={{
        step: 0.01,
        suffix: "ppi"
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
{#if sketchesCount > 1 }
<FieldGroup name="monitors">
    <Field
        key="sampler0"
        value={sampler0}
        on:change={event => {
            sampler0 = Number(event.detail);

            handleChangeSamplers();
        }}
        params={
            {
                options: samplerOptions,
                disabled: monitorDisabled
            }
        }
    />
    <Field
        key="sampler1"
        value={sampler1}
        on:change={event => {
            sampler1 = Number(event.detail);

            handleChangeSamplers();
        }}
        params={
            {
                options: samplerOptions,
                disabled: monitorDisabled
            }
        }
    />
</FieldGroup>
<FieldGroup name="transition">
    <Field
        key="threshold"
        value={$threshold}
        on:change={(event) => $threshold = event.detail }
        params={{
            step: 0.01,
            min: 0,
            max: 1,
        }}
    >
        <Field
            key="switch"
            value={() => $threshold = 1 - Math.round($threshold)}
            params={{
                label: `switch ${Math.round($threshold) > 0 ? `<` : `>`}`
            }}
        />
    </Field>
    <Field
        key="type"
        value={transition}
        on:change={handleChangeTransition}
        params={{
            options: transitionOptions,
        }}
    />
</FieldGroup>

{/if}
