<script>
import Select from "./fields/Select.svelte";
import TextInput from "./fields/TextInput.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";

export let input = '-';
export let event = '-';
export let params = {};

let inputType = input;

let inputs = {
    "Mouse": {
        events: [
            "onMouseDown",
            "onMouseUp",
            "onMouseMove",
            "onClick",
        ]
    },
    "Keyboard": {
        events: [
            "onKeyDown",
            "onKeyPress",
            "onKeyUp",
        ]
    },
    "MIDI": {
        events: [],
        disabled: true,
    },
    "Audio": {
        events: [],
        disabled: true,
    }
};

let inputOptions = [
    { value: "-", disabled: true },
    ...Object.keys(inputs).map((inputName) => ({
        value: inputName,
        disabled: inputs[inputName].disabled,
    }))
];

let events = (inputType && inputs[inputType]) ? inputs[inputType].events : [];
let eventOptions = [
    { value: "-", disabled: true },
    ...events.map((e) => ({ value: e }))
];

function onChangeType(e) {
    input = e.detail;
}


$: {
    console.log("render", input, eventOptions);
}

</script>

<div class="field-triggers__trigger">
    <Select
        name="trigger-input"
        value={input}
        options={inputOptions}
        on:change={onChangeType}
    />
    <Select
        options={eventOptions}
        value={event}
        on:change={(e) => event = e.detail}
        disabled={input === '-'}
        name="trigger-event"
    />
    <TextInput
        name="trigger-custom"
        value=""
        disabled={true}
        label="key"
    />
</div>

<style>

.field-triggers__trigger {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
}
</style>
