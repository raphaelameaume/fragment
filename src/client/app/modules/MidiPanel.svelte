<script>
import { onMount } from "svelte";
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import MIDI from "../inputs/MIDI.js";

let input, output;
let inputs = [], outputs = [];

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

let prevInput = "";
let prevOutput = "";

onMount(async () => {
    await MIDI.request();

    function refresh() {
        inputs = createDeviceOptions(MIDI.inputs);
        outputs = createDeviceOptions(MIDI.outputs);

        input = prevInput ? prevInput : inputs[0].value;
        output = prevOutput ? prevOutput : outputs[0].value;
    }

    MIDI.addEventListener("connected", refresh);
    MIDI.addEventListener("disconnected", () => {
        prevInput = input;
        prevOutput = output;

        refresh();
    });

    refresh();
});

</script>

<Module name="MIDI" {...$$props}>
    <Field
        key="inputs"
        value={input}
        on:change={(event) => input = event.detail}
        params={{
            options: inputs,
        }}
    />
    <Field
        key="outputs"
        value={output}
        on:change={(event) => output = event.detail}
        params={{
            options: outputs,
        }}
    />
</Module>
