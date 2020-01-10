<Panel title="Stage 1" width="33%" direction="column">
    <div slot="header" class="stage__header" style="">
        <div class="stage__live" style="opacity: {renderer.treshold < 1 ? 1 : 0}"></div>
        <Select options={list} value={stage ? stage.name : ''} onChange={({ key }) => handleStageChange('stage1', key)} />
    </div>
    <Dropdown title="Monitor">
        <Preview width={renderer.dimensions.width} height={renderer.dimensions.height} stage={stage} index={index} renderer={renderer}></Preview>
    </Dropdown>
    <Dropdown title="Settings">
        {#if stage !== null}
            {#each Object.keys(stage.props) as propKey}
                <Field prop={stage.props[propKey]} name={propKey} />
            {/each}
        {/if}
    </Dropdown>
</Panel>

<script>
import Panel from "./Panel.svelte";
import Dropdown from "./Dropdown.svelte";
import Field from "./Field.svelte";
import Preview from "./Preview.svelte";
import Select from "./Select.svelte";

export let stage = {};
export let renderer;
export let dimensions;
export let index;

</script>