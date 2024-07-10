<script>
	let { label, children, onclick } = $props();
</script>

<button class="module-header-action__button" aria-label={label} {onclick}>
	{@render children()}
</button>

<style>
	.module-header-action__button {
		color: inherit;
		background: transparent;
		/* opacity: 0.5; */
		display: flex;
		transition: opacity 0.2s ease;
	}

	.module-header-action__button:hover {
		opacity: 1;
	}
</style>
