<script>
import Column from "./LayoutColumn.svelte"; 
import ModuleRenderer from "./ModuleRenderer.svelte";
import Row from "./LayoutRow.svelte"; 
import Root from "./LayoutRoot.svelte";
import { current as currentLayout, tree } from "../stores/layout.js";
import { onDestroy, onMount, setContext } from "svelte";
import { onKeyPress } from "../triggers";

setContext('layout', currentLayout);

let trigger;

onMount(() => {
	trigger = onKeyPress('w', () => {
		$currentLayout.editing = !$currentLayout.editing;
	});
});

onDestroy(() => {
	trigger.destroy();
});

</script>

<Root>
	<Row size={1}>
		<Column size={0.65}>
			<ModuleRenderer name="monitor" />
		</Column>
		<Column size={0.35}>
			<Row size={1}>
				<ModuleRenderer name="exports" />
			</Row>
			<Row size={1}>
				<ModuleRenderer name="params" />
			</Row>
		</Column>
	</Row>
</Root>
