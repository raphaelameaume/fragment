<script>
	let { children } = $props();
</script>

<div class="row">
	{@render children?.()}
</div>

<style>
	.row {
		position: relative;
		display: grid;
		width: 100%;
		column-gap: var(--column-gap);
		grid-template-columns: var(--grid-template-columns, 1fr);
		align-items: center;
	}
</style>
