<script>
import Monitor from "../modules/Monitor.svelte";
import Params from "../modules/Params.svelte";
import { all, names } from "../stores/sketches";
import FloatingParams from "./FloatingParams.svelte";
import Column from "./LayoutColumn.svelte";
import Row from "./LayoutRow.svelte";

let gui;
let defaultGUIConfig = {
	position: "float",
	align: "right",
	size: 0.3,
	output: false,
	hidden: false,
};

let guiConfig = defaultGUIConfig;

$: sketch = $all[names[0]];
$: {
	const config = sketch.buildConfig ? sketch.buildConfig : {};
	gui = config.gui;

	if (gui && typeof gui === "object") {
		guiConfig = {
			...defaultGUIConfig,
			...gui,
		};
	}

	const { styles = "" } = config;

	if (styles !== "") {
		const head = document.getElementsByTagName('head')[0];
		const style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.appendChild(document.createTextNode(styles));
		head.appendChild(style);
	}
}
</script>

{#if gui}
	{#if guiConfig.position === "fixed"}
	<Row>
		{#if guiConfig.align === "right"}
			<Column size={1 - guiConfig.size}>
				<Monitor hasHeader={false} />
			</Column>
			<Column size={guiConfig.size}>
				<Params hasHeader={false} {output}/>
			</Column>
		{:else}
			<Column size={guiConfig.size}>
				<Params hasHeader={false} {output}/>
			</Column>
			<Column size={1 - guiConfig.size}>
				<Monitor hasHeader={false} />
			</Column>
		{/if}
	</Row>
	{:else}
		<Monitor hasHeader={false}/>
		<FloatingParams
			output={guiConfig.output}
			align={guiConfig.align}
			size={guiConfig.size}
			hidden={guiConfig.hidden}
		/>
	{/if}
{:else }
	<Monitor hasHeader={false}/>
{/if}
