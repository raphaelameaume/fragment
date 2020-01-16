<Panel title={title} width={width} direction="column">
    <div slot="header" class="stage__header" style="">
        <div class="stage__live" style="opacity: {treshold < 1 ? 1 : 0}"></div>
        <Select options={list} value={stage ? stage.name : ''} onChange={handleStageChange} />
    </div>
    <Dropdown title="Monitor">
        <Preview
			width={renderer.dimensions.width}
			height={renderer.dimensions.height}
			stage={stage}
		/>
    </Dropdown>
    <Dropdown title="Settings">
        {#if stage !== null}
            {#each Object.keys(stage.props) as propKey}
                <Field prop={stage.props[propKey]} name={propKey} url={`${stage.name}/props/${propKey}`} output={output} />
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
export let onChangeStage = () => {};
export let renderer;
export let width;
export let title;
export let list;
export let output;

$: treshold = renderer.props.treshold.value;
$: {
	console.log(treshold);
}

function handleStageChange({ key }) {
    console.log({ key });
    onChangeStage({ key });
}

</script>

<style>
.stage__live {
	position: relative;
	width: 18px;
	height: 18px;
	
	
	border: 1px solid black;
	border-radius: 2px;
}

.stage__live:before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;

	width: 6px;
	height: 6px;
	margin-left: -3px;
	margin-top: -3px;

	background-color: red;
	border-radius: 50%;
}

.stage__header {
	padding-right: 20px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>