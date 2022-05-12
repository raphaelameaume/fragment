<div class="row">
	<slot></slot>
</div>

<style>
.row {
	display: grid;
	width: 100%;
	column-gap: var(--column-gap);
	grid-template-columns: var(--grid-template-columns, 1fr);
	align-items: center;
}
</style>
