<script>
import Monitor from "../modules/Monitor.svelte";
import Params from "../modules/Params.svelte";
import { all, names } from "../stores/sketches";
import Column from "./LayoutColumn.svelte";
import Row from "./LayoutRow.svelte";

console.log(`Made with Fragment. https://fragment.tools`);

const sketch = $all[names[0]];
const config = sketch.buildConfig ? sketch.buildConfig : {};
const { gui, styles = "" } = config;

const guiConfig = {
	align: "right",
	size: 0.3,
};

if (gui && typeof gui === "object") {
	Object.assign(guiConfig, gui);
}

if (styles !== "") {
	const head = document.getElementsByTagName('head')[0];
	const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
	style.appendChild(document.createTextNode(styles));
	head.appendChild(style);
}

</script>

{#if gui}
	<Row>
		{#if guiConfig.align === "right"}
			<Column size={1 - guiConfig.size}>
				<Monitor hasHeader={false} />
			</Column>
			<Column size={guiConfig.size}>
				<Params hasHeader={false} />
			</Column>
		{:else}
			<Column size={guiConfig.size}>
				<Params hasHeader={false} />
			</Column>
			<Column size={1 - guiConfig.size}>
				<Monitor hasHeader={false} />
			</Column>
		{/if}
	</Row>
{:else}
	<Monitor hasHeader={false}/>
{/if}
