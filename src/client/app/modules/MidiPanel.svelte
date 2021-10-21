<script>
import { onMount } from "svelte";
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import MIDI from "../inputs/MIDI.js";

let inputs = [];
let outputs = [];

if (inputs.length === 0) {
    inputs = [
        { value: "none", label: "No device detected."}
    ];
}

if (outputs.length === 0) {
    outputs = [
        { value: "none", label: "No device detected."}
    ];
}

let input = inputs[0].value;
let output = outputs[0].value;

function createDeviceOptions(deviceMap = new Map()) {
    let options = [];

    if (deviceMap.size !== 0) {
        options.push({ value: "none", label: "No device selected." });
    }

    for (let entry of deviceMap) {
        let device = entry[1];
        const { id, name, manufacturer } = device;

        options.push({ value: id, label: `${manufacturer} ${name} – id: ${id}` });
    }

    if (options.length === 0) {
        options = [
            { value: "none", label: "No device detected."}
        ];
    }

    return options;
}

onMount(async () => {
    await MIDI.request();

    console.log(MIDI.inputs);

    inputs = createDeviceOptions(MIDI.inputs);
    outputs = createDeviceOptions(MIDI.outputs);
});
</script>

<Module name="MIDI" {...$$props}>
    <Field
        key="inputs"
        value={input}
        params={{
            options: inputs,
        }}
    />
    <Field
        key="outputs"
        value={output}
        params={{
            options: outputs,
        }}
    />
</Module>
