<script context="module">
const inputs = {
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
</script>

<script>
import IconCross from "../components/IconCross.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
import FieldInputRow from "./fields/FieldInputRow.svelte";
import Select from "./fields/Select.svelte";
import TextInput from "./fields/TextInput.svelte";
import * as triggersMap from "../triggers/index.js";
import { createEventDispatcher, onDestroy, onMount } from "svelte";

export let index;
export let inputType = undefined;
export let eventName = undefined;
export let enabled = true;
export let controllable = false;
export let triggerable = false;
export let context;
export let onTrigger = () => {};
export let params = { key: []};

let trigger;
let dispatch = createEventDispatcher();

function registerTrigger() {
    if (trigger) {
        enabled = trigger.enabled;

        trigger.destroy();
        trigger = null;
    }

    const createTrigger = triggersMap[eventName];

    trigger = createTrigger(onTrigger, {
        ...params,
        context,
        hot: false,
        enabled,
    });
}

function onTypeChange(event) {
    inputType = event.detail;

    if (!eventOptions.includes(eventName)) {
        eventName = undefined;
        key = null;
    }

    if (trigger) {
        trigger.destroy();
        trigger = null;
    }
}

function onEventChange(event) {
    eventName = event.detail;

    if (inputType === "Mouse") {
        registerTrigger();
    }
}

function onTextChange(e) {
    const castToNumber = ["onControlChange", "onNumberOn", "onNumberOff"].includes(eventName);

    params.key = e.detail.split(',').map((value) => {
        return castToNumber ? Number(value) : value;
    });

    registerTrigger();
}

function handleClickDelete() {
    dispatch('delete', index);
}

function toggleTrigger() {
    if (trigger) {
        trigger.enabled = !trigger.enabled;
    }
}

onMount(() => {
    if (
        (inputType === "Mouse" && eventName) ||
        (inputType && eventName && params.key)
    ) {
        registerTrigger();
    }
});

onDestroy(() => {
    if (trigger) {
        trigger.destroy();
        trigger = null;
    }
});

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

$: isValid = inputType && eventName;
$: key = params.key && params.key.length ? params.key.join(',') : "";

</script>

<div class="field-trigger {inputType ? inputType.toLowerCase() : ""}">
    <FieldInputRow --grid-template-columns="var(--width-activity) var(--width-cols) var(--width-delete)">
        <button
            class="activity"
            class:valid={isValid}
            class:enabled={trigger && trigger.enabled}
            class:disabled={!trigger || !trigger.enabled}
            on:click={toggleTrigger}
        ></button>
        <Select
            name="trigger-input"
            value={inputType}
            options={inputOptions}
            on:change={onTypeChange}
        />
        {#if inputType }
        <Select
            options={eventOptions}
            bind:value={eventName}
            disabled={inputType === undefined}
            on:change={onEventChange}
        />
        {/if}
        {#if inputType === 'Keyboard'}
            <TextInput
                bind:value={key}
                label="key"
                on:input={onTextChange}
            />
        {/if}
        {#if inputType === 'MIDI'}
            <TextInput
                bind:value={key}
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
