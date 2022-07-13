<script>
import Column from "./ColumnNew.svelte"; 
import LayoutComponent from "./LayoutComponent.svelte";
import ModuleRenderer from "./ModuleRendererNew.svelte";
import Row from "./RowNew.svelte"; 
import { current as currentLayout } from "../stores/layout.js";
import { setContext } from "svelte";

setContext('layout', currentLayout);
</script>

<LayoutComponent>
	<Row size={0.5}>
		<Column>
			<ModuleRenderer name="monitor" />
		</Column>
		<Column>
			<Row size={1}>
				<ModuleRenderer name="exports" />
			</Row>
		</Column>
		<Column>
			<Row size={1}>
				<ModuleRenderer name="params" />
			</Row>
		</Column>
	</Row>
	<Row size={0.5}>
		<ModuleRenderer name="midi" />
	</Row>
</LayoutComponent>
