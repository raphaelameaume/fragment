<script>
import Preview from "./ui/Preview.svelte";
import Panel from "./ui/Panel.svelte";
import Select from "./ui/Select.svelte";

import * as stages from "./stages/index.js";

let list = Object.keys(stages).map(key => ({ key: stages[key].name, value: stages[key].name }));
</script>

<main>
	<Panel>
		<Select options={list}></Select>
		<Preview></Preview>
	</Panel>
	<Panel>
		<Select options={list}></Select>
		<Preview></Preview>
	</Panel>
</main>

<style>
main {
	margin: 0 auto;
}
</style>