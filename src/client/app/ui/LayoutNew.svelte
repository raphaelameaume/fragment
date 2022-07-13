<script>
import Column from "./ColumnNew.svelte"; 
import LayoutComponent from "./LayoutComponent.svelte";
import ModuleRenderer from "./ModuleRendererNew.svelte";
import Row from "./RowNew.svelte"; 
</script>

<LayoutComponent>
	<Row size={0.5}>
		<Column>
			<ModuleRenderer module={{ name: "monitor"}} />
		</Column>
		<Column>
			<Row size={1}>
				<ModuleRenderer module={{ name: "exports"}} />
			</Row>
		</Column>
		<Column>
			<Row size={1}>
				<ModuleRenderer module={{ name: "params"}} />
			</Row>
		</Column>
	</Row>
	<Row size={0.5}>
		<ModuleRenderer module={{ name: "midi"}} />
	</Row>
</LayoutComponent>
