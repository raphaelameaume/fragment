<Panel title="Output" width={width} direction="column">
    <div slot="header">
        <div></div>
        <Button onClick={handleClickOpenOutput}>Open</Button>
    </div>
    <Dropdown title="Monitor">
        <PreviewOutput renderer={renderer} />
    </Dropdown>
    <Dropdown title="Settings">
        <Dropdown title="Transition">
            <Field prop={{ value: renderer.treshold.value, min: 0, max: 1, step: 0.01, triggers: [Midi.knob(8)], onChange: ({ value }) => renderer.treshold.value = value }} name="treshold" url="Output/transition" />
        </Dropdown>
        <Dropdown title="Post-processing">
        </Dropdown>
    </Dropdown>
</Panel>

<script>
import Panel from "./Panel.svelte";
import Button from "./Button.svelte";
import Field from "./Field.svelte";
import Dropdown from "./Dropdown.svelte";
import PreviewOutput from "./PreviewOutput.svelte";
import { OutputWindow } from "../core/OutputWindow";
import { Midi } from "../core/Midi";

// props
export let renderer;
export let width;

function handleClickOpenOutput() {
	OutputWindow.open(renderer);
}
</script>

<style>

</style>