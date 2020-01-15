<Panel title="Output" width={width} direction="column">
    <div slot="header">
        <div></div>
        <Button onClick={handleClickOpenOutput}>Open</Button>
    </div>
    <Dropdown title="Monitor">
        <PreviewOutput renderer={renderer} />
    </Dropdown>
    <Dropdown title="Settings">
        {#each Object.keys(renderer.props) as propKey}
            <Field prop={renderer.props[propKey]} name={propKey} url={`Renderer/props/${propKey}`} />
        {/each}
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