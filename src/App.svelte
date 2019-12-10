<script>
import Renderer from "./core/Renderer.js";
import Preview from "./ui/Preview.svelte";
import Panel from "./ui/Panel.svelte";
import Select from "./ui/Select.svelte";

import * as stages from "./stages/index.js";

let list = Object.keys(stages).map(key => ({ key: stages[key].name, value: stages[key].name }));
let stage1 = null;
let stage2 = null;

let { renderer, gl, dimensions } = Renderer();

$: current = {
	stage1: null,
	stage2: null,
};

let instanced = {};

function handleStageChange(stage, key) {
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

	current[stage] = instanced[key].instance;

	console.log(current);
}

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

	background-color: blue;
}
</style>