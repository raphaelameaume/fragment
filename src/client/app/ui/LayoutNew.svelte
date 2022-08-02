<script>
import Column from "./ColumnNew.svelte"; 
import LayoutComponent from "./LayoutComponent.svelte";
import ModuleRenderer from "./ModuleRendererNew.svelte";
import Row from "./RowNew.svelte"; 
import { current as currentLayout, tree } from "../stores/layout.js";
import { onDestroy, onMount, setContext } from "svelte";
import { onKeyPress } from "../triggers";
import LayoutRoot from "./LayoutRoot.svelte";

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

<LayoutRoot>
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
</LayoutRoot>
