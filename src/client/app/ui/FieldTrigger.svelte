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

$: eventOptions = inputType === '-' ? ['-'] : [
    { value: '-', disabled: true },
    ...inputs[inputType].events.map(e => ({ value: e }))
]

function dispatchEvent() {
    dispatch('change', { input: inputType, event, params });
}

function onInputChange(e) {
    const needsDispatch = inputType !== e.detail && inputType !== '-';

    inputType = e.detail;
    event = '-';

    if (needsDispatch) {
        dispatchEvent();
    }
}

function onEventChange(e) {
    event = e.detail;

    const isKeyboard = inputType === 'Keyboard';

    if (!isKeyboard) {
        params = {};
    }

    if (!isKeyboard || (isKeyboard && (params.key && params.key !== ''))) {
        dispatchEvent();
    }
}

function onTextChange(e) {
    params.key = e.currentTarget.value;

    dispatchEvent();
}

</script>

<div class="field-triggers__trigger" class:mouse={inputType === "Mouse"} class:keyboard={inputType === "Keyboard"}>
    <Select
        name="trigger-input"
        value={inputType}
        options={inputOptions}
        on:change={onInputChange}
    />
    <Select
        options={eventOptions}
        value={event}
        on:change={onEventChange}
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
