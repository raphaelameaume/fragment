<script>
import { createEventDispatcher } from "svelte";
import Select from "./fields/Select.svelte";
import TextInput from "./fields/TextInput.svelte";

export let input = '-';
export let eventName = '-';
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
    "Touch": {
        events: [
            "onTouchStart",
            "onTouchEnd",
            "onTouchMove",
            "onClick",
        ],
        disabled: true,
    },
    "Pointer": {
        events: [
            "onDown",
            "onUp",
            "onMove",
            "onClick",
        ],
        disabled: true,
    },
    "Keyboard": {
        events: [
            "onKeyDown",
            "onKeyPress",
            "onKeyUp",
        ]
    },
    "MIDI": {
        events: [
            "onNoteOn",
            "onNoteOff",
            "onNumberOn",
            "onNumberOff",
            "onControlChange"
        ],
        disabled: false,
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
    dispatch('change', { inputType, eventName, params });
}

function onInputChange(e) {
    const needsDispatch = inputType !== e.detail && inputType !== '-';

    inputType = e.detail;
    eventName = '-';

    if (needsDispatch) {
        dispatchEvent();
    }
}

function onEventChange(e) {
    let prevEventName = eventName;

    eventName = e.detail;

    const keepParams = (
        inputType === 'Keyboard' ||
        inputType === "MIDI" && (
            (["onNoteOn", "onNoteOff"].includes(prevEventName) && ["onNoteOn", "onNoteOff"].includes(eventName)) ||
            (["onNumberOn", "onNumberOff"].includes(prevEventName) && ["onNumberOn", "onNumberOff"].includes(eventName))
        )
    );

    if (!keepParams) {
        params = {};
    }

    if (!keepParams || (keepParams && (params.key && params.key !== ''))) {
        dispatchEvent();
    }
}

function onTextChange(e) {
    params.key = e.currentTarget.value;

    dispatchEvent();
}

</script>

<div class="field-triggers__trigger {inputType.toLowerCase()}">
    <Select
        name="trigger-input"
        value={inputType}
        options={inputOptions}
        on:change={onInputChange}
    />
    <Select
        options={eventOptions}
        value={eventName}
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
    {#if inputType === 'MIDI'}
        <TextInput
            name="trigger-custom"
            value={params.key ? params.key : ""}
            label={["onNoteOn", "onNoteOff"].includes(eventName) ? "note" : "number"}
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

.field-triggers__trigger.keyboard, .field-triggers__trigger.midi {
    display: grid;
    grid-template-columns: 0.75fr 1fr 1fr;
}
</style>
