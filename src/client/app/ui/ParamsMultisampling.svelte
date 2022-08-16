<script>
import { monitors } from "../modules/Monitor.svelte";
import { current as currentRendering, canvases } from "../stores/rendering.js";
import { multisampling, threshold } from "../stores/multisampling.js";
import { transitions } from "../transitions/index.js";
import Field from "./Field.svelte";
import FieldGroup from "./FieldGroup.svelte";

let transition = $threshold;

let monitorDisabled = false;
let sampler0 = -1;
let sampler1 = -1;

$: samplerOptions = $monitors
	.map((monitor, index) => ({ label: `monitor ${index+1}`, value: monitor.id })) // set index first so it matches <Monitor>
    .filter((option) => {
		const monitor = $monitors.find((m) => m.id === option.value);

		return monitor.selected !== "output";
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

	console.log("update multisampling");
}

let transitionOptions = Object.keys(transitions).map((key) => {
    const transition = transitions[key];
    const label = transition.name ? transition.name : key;
    return { value: key, label };
});

function handleChangeTransition(event) {
    transition = event.detail;
    $currentRendering.transition = transition;
}

</script>
<FieldGroup name="monitors">
    <Field
        key="sampler0"
        value={sampler0}
        on:change={event => {
            sampler0 = Number(event.detail);
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
