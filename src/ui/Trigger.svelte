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
import { Keyboard } from "../core/Keyboard.js";

export let trigger = {
    type: "keyboard",
    value: ['h', 'H'],
    enabled: true,
};
export let onDelete = () => {};

let options = [
    { label: "Keyboard", key: "keyboard" },
    { label: Midi.KEY_DOWN, key: Midi.KEY_DOWN },
    { label: Midi.KEY_UP, key: Midi.KEY_UP },
    { label: Midi.KNOB, key: Midi.KNOB },
    { label: Midi.NOTE_ON, key: Midi.NOTE_ON },
    { label: Midi.NOTE_OFF, key: Midi.NOTE_OFF },
];

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

    if (trigger.type === 'keyboard') {
        Keyboard.addTrigger(trigger);
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
