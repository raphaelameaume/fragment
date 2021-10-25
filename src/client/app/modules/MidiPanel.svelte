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

let messages = [];

$: {
    MIDI.selectedInputID = input;
    console.log(MIDI.selectedInputID);
}

$: {
    MIDI.selectedOutputID = output;
}

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

    MIDI.addEventListener("message", (event) => {
        const { type, note, channel, value } = event;
        let date = new Date();
        let time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

        let noteLog = ["noteon", "noteoff"].includes(type) ? ` note:${note.name}` : ``; 

        // messages = [
        //     ...messages,
        //     `${time} ${type} number:${note.number}${noteLog}`,
        // ]
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
    <Field
        key="messages"
        value={messages}
        type="list"
        params={{
            disabled: true
        }}
    />
</Module>
