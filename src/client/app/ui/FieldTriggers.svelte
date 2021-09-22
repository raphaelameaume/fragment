<script>
import Select from "./fields/Select.svelte";
import TextInput from "./fields/TextInput.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
</script>

<header class="field-triggers__header">
    <span class="field-triggers__title">input</span>
    <span class="field-triggers__title">event</span>
    <span class="field-triggers__title"></span>
</header>
<div class="field-triggers__trigger">
    <Select
        name="trigger-input"
        value="Mouse"
        options={["Mouse", "Keyboard", "Midi", "Audio"]}
    />
    <Select
        options={["onMouseDown", "onClick", "onMouseUp"]}
        value={"onMouseDown"}
        name="trigger-event"
    />
    <TextInput
        name="trigger-custom"
        value="hello"
    />
</div>
<ButtonInput label={"Add"} />

<style>
.field-triggers__header {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    margin-bottom: 5px;
}

.field-triggers__title {
    display: block;
    margin-right: var(--padding);

    color: #f0f0f0;
    font-size: 10px;
    font-family: "Jetbrains Mono";
    text-align: center;

    opacity: 0.75;
}

.field-triggers__trigger {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
}
</style>
