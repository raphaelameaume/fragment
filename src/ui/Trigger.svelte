<div class="trigger">
    <Select options={options} value={trigger.type} onChange={handleChangeType} />
    <TextInput width="40px" value={inputValue} onSubmit={handleSubmit} />
    <Button style="width: 60px; line-height: 10px; margin: 0;" onClick={handleClickToggle}>{label}</Button>
</div>

<script>
import Button from "./Button.svelte";
import Select from "./Select.svelte";
import TextInput from "./TextInput.svelte";
import { Midi } from "../core/Midi.js";
import { Audio } from "../core/Audio.js";
import { Keyboard } from "../core/Keyboard.js";

export let trigger = {
    type: "keyboard",
    value: ['h', 'H'],
    enabled: true,
};
export let onDelete = () => {};

let all = [
    Keyboard.TRIGGER_KEY_PRESS,
    Keyboard.TRIGGER_KEY_UP,
    Keyboard.TRIGGER_KEY_DOWN,
    Midi.TRIGGER_KEY_DOWN,
    Midi.TRIGGER_KEY_UP,
    Midi.TRIGGER_NOTE_ON,
    Midi.TRIGGER_NOTE_OFF,
    Midi.TRIGGER_KNOB,
    Audio.TRIGGER_BEAT,
];

let options = all.map( opt => ({ label: opt, key: opt }));

$: label = trigger.enabled ? 'Disable' : 'Enable';
$: inputValue = Array.isArray(trigger)? trigger.value.join(',') : trigger.value;

let type = trigger.type;

function handleSubmit(newValue) {
    let values = newValue.split(',');
    values = values.map( v => {
        if (Number(v) == v) {
            return Number(v);
        }

        return v;
    });

    trigger.value = values;

    onTriggerTypeChange();
}

function handleClickToggle() {
    trigger.enabled = !trigger.enabled;
}

function handleClickDelete() {
    onDelete();
}

function handleChangeType({ key }) {
    console.log('Trigger :: handleChangeType');

    trigger.type = key;
    onTriggerTypeChange();
}

function onTriggerTypeChange() {
    trigger.destroy();

    type = trigger.type;

    if ([Keyboard.TRIGGER_KEY_UP, Keyboard.TRIGGER_KEY_DOWN, Keyboard.TRIGGER_KEY_PRESS].includes(trigger.type)) {
        Keyboard.addTrigger(trigger);
    } else if ([Audio.TRIGGER_BEAT].includes(trigger.type)) {
        Audio.addTrigger(trigger);
    } else {
        Midi.addTrigger(trigger);
    }
}

</script>

<style>
.trigger {
    display: flex;
    width: 100%;
    height: 30px;
    justify-content: space-around;
    align-items: center;
}

</style>
