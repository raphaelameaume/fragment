<script>
import { emit, TRANSITION_CHANGE } from "../events";
import { current as currentRendering } from "../stores/rendering.js";
import Field from "./Field.svelte";
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

if (!$currentRendering.threshold) {
    $currentRendering.threshold = 0.5;
}

let transition;

let transitionOptions = Object.keys(transitions).map((key) => {
    const transition = transitions[key];
    const label = transition.name ? transition.name : key;
    return { value: key, label };
});

if (!$currentRendering.transition) {
    $currentRendering.transition = transitionOptions[0].value;
    emit(TRANSITION_CHANGE, transitions[$currentRendering.transition]);
}

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
    key="threshold"
    value={$currentRendering.threshold}
    on:change={(event) => $currentRendering.threshold = event.detail }
    params={{
        step: 0.01,
        min: 0,
        max: 1,
    }}
/>

<Field
    key="transition"
    value={transition}
    on:change={handleChangeTransition}
    params={{
        options: transitionOptions,
    }}
/>
