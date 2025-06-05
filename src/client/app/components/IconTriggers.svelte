<script>
	let { setup = false, active = false } = $props();
</script>

<svg
	width="8"
	height="16"
	fill="none"
	viewBox="0 0 12 24"
	class:active
	class:setup
>
	<circle class="circle" cx="6" cy="6" r="1.5"></circle>
	<circle class="circle" cx="6" cy="12" r="1.5"></circle>
	<circle class="circle" cx="6" cy="18" r="1.5"></circle>
</svg>

<style>
	.circle {
		fill: currentColor;
	}

	.setup:not(.active) .circle:nth-child(1) {
		fill: var(--color-red);
	}

	.active .circle {
		fill: var(--color-green);
	}
</style>
