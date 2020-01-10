<div class="trigger">
    <Select options={options} value={trigger.type} />
    <TextInput width="40px" prop={{value:inputValue}} onSubmit={handleSubmit} />
    <Button style="width: 60px; line-height: 10px; margin: 0;" onClick={handleClickToggle}>{label}</Button>
</div>

<script>
import Button from "./Button.svelte";
import Select from "./Select.svelte";
import TextInput from "./TextInput.svelte";

export let trigger = {
    type: "keyboard",
    value: ['h', 'H'],
    enabled: true,
};
export let onDelete = () => {};

let options = [
    { value: "Keyboard", key: "keyboard" },
    { value: "MIDI-Pad", key: "midi-pad" },
    { value: "MIDI-Knob", key: "midi-knob" },
];

$: label = trigger.enabled ? 'Disable' : 'Enable';
$: inputValue = Array.isArray(trigger)? trigger.value.join(',') : trigger.value;

function handleSubmit(newValue) {
    let values = newValue.split(',');

    console.log({ values });

    trigger.value = values;
}

function handleClickToggle() {
    trigger.enabled = !trigger.enabled;
}

function handleClickDelete() {
    onDelete();
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
