<script>
import { createEventDispatcher } from "svelte";
import IconCross from "../components/IconCross.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
import FieldInputRow from "./fields/FieldInputRow.svelte";
import Select from "./fields/Select.svelte";
import TextInput from "./fields/TextInput.svelte";

export let trigger;
export let controllable = false;
export let triggerable = false;

let inputType = trigger.inputType;
let eventName = trigger.eventName;
let params = trigger.params;

$: isValid = inputType && eventName;

const dispatch = createEventDispatcher();

let inputs = {
    "Mouse": {
        events: [
            { name: "onMouseDown", triggerable: true, controllable: false },
            { name: "onMouseUp", triggerable: true, controllable: false },
            { name: "onMouseMove", triggerable: true, controllable: false },
            { name: "onClick", triggerable: true, controllable: false },
        ]
    },
    "Keyboard": {
        events: [
            { name: "onKeyDown", triggerable: true, controllable: false },
            { name: "onKeyPress", triggerable: true, controllable: false },
            { name: "onKeyUp", triggerable: true, controllable: false },
        ]
    },
    "MIDI": {
        events: [
            { name: "onNoteOn", triggerable: true, controllable: false },
            { name: "onNoteOff", triggerable: true, controllable: false },
            { name: "onNumberOn", triggerable: true, controllable: false },
            { name: "onNumberOff", triggerable: true, controllable: false },
            { name: "onControlChange", triggerable: false, controllable: true },
        ],
    }
};

$: validInputs = [...Object.keys(inputs)].reduce((all, inputName) => {
    const input = inputs[inputName];
    const { disabled, events } = input;
    const filteredEvents = events.filter((event) => {
        return event.triggerable === triggerable && event.controllable === controllable;
    });

    if (filteredEvents.length > 0) {
        all[inputName] = { events: filteredEvents, disabled };
    };
    
    return all;
}, {});

$: inputOptions = [
    { label: "Select input", value: undefined, disabled: true },
    ...Object.keys(validInputs).map((inputName) => ({
        value: inputName,
        disabled: validInputs[inputName].disabled,
    }))
];

$: eventOptions = inputType ? [
    { label: "-", value: undefined, disabled: true },
    ...validInputs[inputType].events.map(event => ({ value: event.name }))
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
        trigger.enabled = typeof inputType === "string" && typeof eventName === "string";
        dispatchEvent();
    }
}

function onTextChange(e) {
    params.key = e.currentTarget.value;

    console.log("params key", params);

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
        />
        {/if}
        {#if inputType === 'Keyboard'}
            <TextInput
                value={params.key ? params.key : ""}
                label="key"
                on:input={onTextChange}
            />
        {/if}
        {#if inputType === 'MIDI'}
            <TextInput
                value={params.key ? params.key : ""}
                label={["onNoteOn", "onNoteOff"].includes(eventName) ? "note" : "number"}
                on:input={onTextChange}
            />
        {/if}
        <ButtonInput
            label="delete"
            showLabel={false}
            on:click={handleClickDelete}
            --color-text="white"
            --background-color="var(--color-red)"
            --box-shadow-color-active="var(--color-lightred)"
        >
            <IconCross />
        </ButtonInput>
    </FieldInputRow>
</div>

<style>

.field-trigger {
    --width-delete: var(--height-input);
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
