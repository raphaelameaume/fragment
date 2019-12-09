<script>
import Preview from "./ui/Preview.svelte";
import Panel from "./ui/Panel.svelte";
import Select from "./ui/Select.svelte";

import * as stages from "./stages/index.js";

let list = Object.keys(stages).map(key => ({ key: stages[key].name, value: stages[key].name }));
let scene1 = null;
let scene2 = null;
</script>

<main>
	<div class="panels">
		<Panel>
			<Preview></Preview>
			<Select options={list} onChange={({ key }) => scene1 = list[key]}></Select>
		</Panel>
		<Panel>
			<Preview></Preview>
			<Select options={list} onChange={({ key }) => scene2 = list[key]}></Select>
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