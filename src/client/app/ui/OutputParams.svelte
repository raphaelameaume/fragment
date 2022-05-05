<script>
import { emit, TRANSITION_CHANGE } from "../events";
import { current as currentRendering, SIZES, threshold } from "../stores/rendering.js";
import { sketchesCount } from "@fragment/props";
import Field from "./Field.svelte";
import FieldGroup from "./FieldGroup.svelte";
import { transitions } from "../transitions/index.js";

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

</script>

<Field
    key="canvasSize"
    value={$currentRendering.resizing}
    on:change={(event) => {
        let aspectRatio = 1;

        if (event.detail === SIZES.ASPECT_RATIO) {
            // compute aspect ratio based on previous props
            aspectRatio = $currentRendering.width / $currentRendering.height;
        }

        currentRendering.update((curr) => {
            return {
                ...curr,
                resizing: event.detail,
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
    key="pixelRatio"
    value={$currentRendering.pixelRatio}
    on:change={(event) => $currentRendering.pixelRatio = event.detail }
    params={{
        step: 0.1,
    }}
/>
{#if sketchesCount > 1 }
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
                label: "switch"
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
