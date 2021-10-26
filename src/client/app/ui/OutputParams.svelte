<script>
import { emit, TRANSITION_CHANGE } from "../events";
import { current as currentRendering, threshold } from "../stores/rendering.js";
import { sketchesCount } from "@fragment/props";
import Field from "./Field.svelte";
import FieldGroup from "./FieldGroup.svelte";
import { transitions } from "../transitions/index.js";

function handleChangeDimensions(event) {
    const [width, height] = event.detail;

    currentRendering.update((curr) => {
        return {
            ...curr,
            width,
            height
        }
    });
}

let transition = $threshold;

let transitionOptions = Object.keys(transitions).map((key) => {
    const transition = transitions[key];
    const label = transition.name ? transition.name : key;
    return { value: key, label };
});

// if (!$currentRendering.transition) {
//     $currentRendering.transition = transitionOptions[0].value;
//     emit(TRANSITION_CHANGE, transitions[$currentRendering.transition]);
// }

function handleChangeTransition(event) {
    transition = event.detail;
    $currentRendering.transition = transition;

    emit(TRANSITION_CHANGE, transitions[transition]);
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
        locked: false
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
<Field
    key="optimize"
    value={false}
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
