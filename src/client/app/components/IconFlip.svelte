<script>
	let { angle = 0 } = $props();
</script>

<svg
	width="16"
	height="16"
	fill="none"
	viewBox="0 0 24 24"
	style="--angle: {angle}"
>
	<path
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.5"
		d="M18 8H6"
	></path>
	<path
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.5"
		d="M10 5L6 8L10 11"
	></path>
	<path
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.5"
		d="M6 16H18"
	></path>
	<path
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="1.5"
		d="M14 13L18 16L14 19"
	></path>
</svg>

<style>
	svg {
		transform: rotate(var(--angle));
	}
</style>
