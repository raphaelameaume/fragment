<script>
import { onMount } from "svelte";
import Renderer from "./core/Renderer.js";
import Preview from "./ui/Preview.svelte";
import Panel from "./ui/Panel.svelte";
import Select from "./ui/Select.svelte";
import Tabs from "./ui/Tabs.svelte";
import TabList from "./ui/TabList.svelte";
import Tab from "./ui/Tab.svelte";
import TabPanel from "./ui/TabPanel.svelte";
import Field from "./ui/Field.svelte";
import Dropdown from "./ui/Dropdown.svelte";

import * as stages from "./stages/index.js";

let list = Object.keys(stages).map(key => ({ key: stages[key].name, value: stages[key].name }));

let { renderer, gl, dimensions } = Renderer();

$: current = {
	stage1: null,
	stage2: null,
};

let instanced = {};

function handleStageChange(id, key) {
	setStage(id, key);
}

function setStage(id, key) {
	if (!instanced[key]) {
		const { scene, name, props } = stages[key];

		stages[key].instance = new scene({
			name,
			gl,
			renderer,
			props,
		});

		instanced[key] = stages[key];
	}

	current[id] = instanced[key];
}

onMount(() => {
	Object.keys(stages).forEach((name, index) => {
		if (index < 2) {
			setStage(`stage${index+1}`, name);
		}
	});
});

let propInputWebcam = {
	name: "webcam",
	type: "button",
	onTrigger: () => {
		console.log('request webcam access');
	}
};

</script>

<main>
	<div class="panels">
		<Panel>
			<Preview width={dimensions.width} height={dimensions.height} stage={current.stage1}></Preview>
			<Select options={list} onChange={({ key }) => handleStageChange('stage1', key)}></Select>
		</Panel>
		<Panel>
			<Preview width={dimensions.width} height={dimensions.height} stage={current.stage2}></Preview>
			<Select options={list} onChange={({ key }) => handleStageChange('stage2', key)}></Select>
		</Panel>
	</div>
	<div class="live">
		<Tabs>
			<TabList>
				<Tab>Input</Tab>
				<Tab>Output</Tab>
			</TabList>
			<TabPanel>
				<Dropdown title="Audio">
				</Dropdown>
				<Dropdown title="Video">
					<Field prop={propInputWebcam} name={propInputWebcam.name} />
				</Dropdown>
			</TabPanel>
			<TabPanel>
				<h2>Output controls</h2>
			</TabPanel>
		</Tabs>
	</div>
	<div class="controls">
		<Tabs>
			<TabList>
				<Tab>Stage 1</Tab>
				<Tab>Stage 2</Tab>
			</TabList>
			<TabPanel>
				{#if current.stage1 !== null}
					{#each Object.keys(current.stage1.props) as propKey}
						<Field prop={current.stage1.props[propKey]} name={propKey} />
					{/each}
				{/if}
			</TabPanel>
			<TabPanel>
				{#if current.stage2 !== null}
					{#each Object.keys(current.stage2.props) as propKey}
						<Field prop={current.stage2.props[propKey]} name={propKey} />
					{/each}
				{/if}
			</TabPanel>
		</Tabs>
	</div>
</main>

<style>
main {
	position: relative;

	height: 100%;

	margin: 0 auto;
}

.panels {
	position: absolute;
	left: 0;
	top: 0;

	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	align-items: center;
	width: 40vw;
	height: 100%;
	padding: 0 20px;

	background-color: lightgray;
}

.live {
	position: absolute;
	top: 0;
	left: 40vw;

	display: flex;
	width: 60vw;
	height: 50vh;

	background-color: lightgreen;
}

.controls {
	position: absolute;
	top: 50vh;
	left: 40vw;

	width: 60vw;
	height: 50vh;

	background: lightblue;
}
</style>