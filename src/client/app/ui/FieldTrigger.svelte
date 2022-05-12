<script>
import { createEventDispatcher } from "svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
import FieldInputRow from "./fields/FieldInputRow.svelte";
import Select from "./fields/Select.svelte";
import TextInput from "./fields/TextInput.svelte";

export let trigger;

let inputType = trigger.inputType;
let eventName = trigger.eventName;
let params = trigger.params;
let enabled = trigger.enabled;

$: isValid = inputType && eventName;

const dispatch = createEventDispatcher();

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

$: inputOptions = [
    { label: "Select input", value: undefined, disabled: true },
    ...Object.keys(inputs).map((inputName) => ({
        value: inputName,
        disabled: inputs[inputName].disabled,
    }))
];

$: eventOptions = inputType ? [
    { label: "-", value: undefined, disabled: true },
    ...inputs[inputType].events.map(e => ({ value: e }))
] : [];


function dispatchEvent() {
    trigger.inputType = inputType;
    trigger.eventName = eventName;
    trigger.params = params;
    dispatch('change', trigger);
}

function onInputChange(e) {
    const needsDispatch = inputType && inputType !== e.detail;

    inputType = e.detail;
    eventName = undefined;

    if (needsDispatch) {
        dispatchEvent();
    }
}

function onEventChange(e) {
    let prevEventName = eventName;

    eventName = e.detail;

    let keepParams = (
        inputType === 'Keyboard' ||
        inputType === "MIDI" && (
            (["onNoteOn", "onNoteOff"].includes(prevEventName) && ["onNoteOn", "onNoteOff"].includes(eventName)) ||
            (["onNumberOn", "onNumberOff"].includes(prevEventName) && ["onNumberOn", "onNumberOff"].includes(eventName))
        )
    );

    keepParams = false;

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

function handleClickDelete() {
    dispatch('delete', trigger);
}

function onClickActivity() {
    trigger.enabled = !trigger.enabled;
    dispatchEvent();
}

</script>

<div class="field-trigger {inputType ? inputType.toLowerCase() : ""}">
    <FieldInputRow --grid-template-columns="var(--width-activity) var(--width-cols) var(--width-delete)">
        <button
            class="activity"
            class:valid={isValid}
            class:enabled={trigger.enabled}
            class:disabled={!trigger.enabled}
            on:click={onClickActivity}
        ></button>
        <Select
            name="trigger-input"
            value={inputType}
            options={inputOptions}
            on:change={onInputChange}
        />
        {#if inputType }
        <Select
            options={eventOptions}
            value={eventName}
            on:change={onEventChange}
            disabled={inputType === '-'}
            name="trigger-event"
        />
        {/if}
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
        <ButtonInput
            label="delete"
            on:click={handleClickDelete}
            --inputColor="white"
            --background-color="var(--color-red)"
            --box-shadow-color="var(--color-red)"
        />
    </FieldInputRow>
</div>

<style>

.field-trigger {
    --width-delete: 50px;
    --width-input: 90px;
    --width-activity: 16px;
    --width-cols: 1fr;

    width: 100%;
}

.activity {
    --background-color: rgba(255, 255, 255, 0.5);

    position: relative;

    width: var(--width-activity);
    height: 100%;

    background-color: transparent;
}

.activity:before {
    --size: 4px;

    content: '';

    position: absolute;
    top: calc(50% - var(--size) * 0.5);
    left: calc(50% - var(--size) * 0.5);

    width: var(--size);
    height: var(--size);
    border-radius: 2px;

    background-color: var(--background-color);
}

.activity.valid.enabled {
    --background-color: var(--color-green);
}

.activity.valid.disabled {
    --background-color: var(--color-red);
}

.field-trigger.mouse {
    --width-cols: var(--width-input) 1fr;
}

.field-trigger.keyboard, .field-trigger.midi {
    --width-cols: var(--width-input) 1fr 0.75fr;
}
</style>
