<Panel title={title} width={width} direction="column">
    <div slot="header" class="stage__header" style="">
        <div class="stage__live" style="opacity: {treshold < 1 ? 1 : 0}"></div>
        <Select options={list} value={stage.name} onChange={handleStageChange} />
    </div>
    <Dropdown title="Monitor">
        <Preview
			renderer={renderer}
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
import { getContext } from "svelte";
import Panel from "./Panel.svelte";
import Dropdown from "./Dropdown.svelte";
import Field from "./Field.svelte";
import Preview from "./Preview.svelte";
import Select from "./Select.svelte";
import { Storage } from "../core/Storage.js";

// props
export let renderer;
export let width;
export let title;
export let output;
export let index;
export let stages;

let url = `PanelStage/${index}`;
let stageNames = Object.keys(stages);
let list = stageNames.map(key => ({
	key: key,
    label: stages[key].name,
}));
let count = list.length;
let stage = count < 2 ? stages[stageNames[index]] : stages[stageNames[index * 2]];
let treshold = renderer.props.treshold.value;

let currentStages = getContext('currentStages');
let stageList = list.map( item => item);

$: {
	if (!stage.instance) {
		let { name, props, scene } = stage;
		stage.instance = new scene({
			name,
			props,
			renderer,
		});
	}

	currentStages.update((value) => {
		let key = `stage${index+1}`;

		return {
			...value,
			[`${key}`]: stage,
		};
	});
}

function handleStageChange({ key }) {
	stage = stages[key];
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