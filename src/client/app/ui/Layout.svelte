<script>
import Root from "./LayoutRoot.svelte";
import Column from "./LayoutColumn.svelte"; 
import Row from "./LayoutRow.svelte"; 
import ModuleRenderer from "./ModuleRenderer.svelte";
import { layout } from "../stores/layout.js";
import KeyBinding from "../components/KeyBinding.svelte";

function toggleEdition() {
	$layout.editing = !$layout.editing;
}

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
<KeyBinding key="w" on:trigger={toggleEdition} />
{#if $layout.editing}
	<KeyBinding key="Escape" type="down" on:trigger={toggleEdition} />
{/if}
