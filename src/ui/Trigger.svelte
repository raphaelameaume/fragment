<div class="trigger">
    <span class="type">{trigger.type}</span>
    <TextInput width="40px" value={inputValue} onSubmit={handleSubmit} />
    <Button style="width: 70px; line-height: 10px; margin: 0;" onClick={handleClickToggle}>{label}</Button>
</div>

<style>
.trigger {
    display: flex;
    width: 100%;
    height: 30px;
    justify-content: space-around;
    align-items: center;
}

</style>

<script>
import Button from "./Button.svelte";
import TextInput from "./TextInput.svelte";

export let trigger = {
    type: "Keyboard",
    value: ['h', 'H'],
    enabled: true,
}

$: label = trigger.enabled ? 'Disable' : 'Enable';
$: inputValue = trigger.value.join(',');

function handleSubmit(newValue) {
    let values = newValue.split(',');

    console.log(values);
    trigger.value = values;
}

function handleClickToggle() {
    trigger.enabled = !trigger.enabled;
}
</script>
