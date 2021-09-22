<script>
import { createEventDispatcher } from "svelte";
import Select from "./fields/Select.svelte";
import TextInput from "./fields/TextInput.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";

export let input = '-';
export let event = '-';
export let params = {};

const dispatch = createEventDispatcher();

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

function onEventChange() {
    if (inputType !== 'Keyboard') {
        dispatch('change', { input, event });
    }
}

function onTextChange(e) {
    dispatch('change', { input, event, params: {
        key: e.currentTarget.value
    }});
}

</script>

<div class="field-triggers__trigger" class:mouse={inputType === "Mouse"} class:keyboard={inputType === "Keyboard"}>
    <Select
        name="trigger-input"
        value={inputType}
        options={inputOptions}
        on:change={(e) => inputType = e.detail}
    />
    <Select
        options={inputType === '-' ? ['-'] : inputs[inputType].events}
        value={event}
        on:change={(e) => event = e.detail}
        disabled={inputType === '-'}
        name="trigger-event"
    />
    {#if inputType === 'Keyboard'}
        <TextInput
            name="trigger-custom"
            value={params.key ? params.key : ""}
            label="key"
            on:input={onTextChange}
        />
    {/if}
</div>

<style>

.field-triggers__trigger {
    display: grid;
    width: 100%;
    grid-template-columns: 0.75fr 2fr;
}

.field-triggers__trigger.keyboard {
    display: grid;
    grid-template-columns: 0.75fr 1fr 1fr;
}
</style>
