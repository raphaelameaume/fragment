<script>
import Column from "./ColumnNew.svelte"; 
import Row from "./RowNew.svelte"; 

</script>

<div class="layout">
<Column>
	<Row>
		<Column><h1>Monitor</h1></Column>
		<Column>
			<Row>
				<Column><h1>Exports</h1></Column>
				<Column><h1>Exports 2</h1></Column>
			</Row>
			<Row>
				<h1>Params</h1>
			</Row>
		</Column>
	</Row>
	<Row>
		<h1>MIDI</h1>
	</Row>
</Column>
</div>

<style>
.layout {
	position: relative;
    display: grid;
    width: 100%;
    height: 100%;
    align-content: stretch;
}
</style>
