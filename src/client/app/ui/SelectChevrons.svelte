<script>
	export let width = 24;
	export let height = 24;
</script>

<div class="chevrons" style={`width: ${width}px;`}>
	<svg
		class="chevron chevron-bottom"
		{width}
		{height}
		fill="none"
		viewBox="0 0 24 24"
	>
		<path
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M15.25 10.75L12 14.25L8.75 10.75"
		/>
	</svg>
</div>

<style>
	.chevrons {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		width: 15px;

		color: inherit;
		pointer-events: none;
	}
</style>
