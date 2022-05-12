<script>
import { createEventDispatcher } from "svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
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
    { label: "Select input", value: "-", disabled: true },
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
    console.log("FieldTrigger :: dispatch delete");
    dispatch('delete');
}

</script>

<div class="field-triggers__trigger {inputType.toLowerCase()}">
    <button class="activity" class:enabled={inputType !== "-"}>
    </button>
    <Select
        name="trigger-input"
        value={inputType}
        options={inputOptions}
        on:change={onInputChange}
    />
    {#if inputType !== "-" }
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
</div>

<style>

.field-triggers__trigger {
    --width-delete: 50px;
    --width-activity: 16px;

    display: grid;
    width: 100%;
    grid-template-columns: var(--width-activity) 1fr var(--width-delete);
    align-items: center;
}

.activity {
    --size: 4px;
    --background-color: rgba(255, 255, 255, 0.5);
    width: var(--size);
    height: var(--size);
    margin-left: calc((var(--width-activity) - var(--size)) * 0.5);
    border-radius: 2px;

    background-color: var(--background-color);
}

.activity.enabled {
    --background-color: var(--color-green);
}

.activity.disabled {
    --background-color: var(--color-red);
}

.field-triggers__trigger.mouse {
    grid-template-columns: var(--width-activity) 90px 1fr var(--width-delete);
}

.field-triggers__trigger.keyboard, .field-triggers__trigger.midi {
    grid-template-columns: var(--width-activity) 90px 1fr 0.75fr var(--width-delete);
}
</style>
