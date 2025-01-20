<script>
	import { onMount } from 'svelte';

	let showLabel = $state(false);

	onMount(() => {
		let timeout = setTimeout(() => {
			showLabel = true;
		}, 250);

		return () => {
			clearTimeout(timeout);
			timeout = null;
		};
	});
</script>

<div class="hint-loading">
	{#if showLabel}
		<div class="label">
			<span>loading</span>
			<svg width="10" height="6">
				<circle cx="2" cy="5" r="1" fill="var(--color)" />
				<circle cx="5" cy="5" r="1" fill="var(--color)" />
				<circle cx="8" cy="5" r="1" fill="var(--color)" />
			</svg>
		</div>
	{/if}
</div>

<style>
	.hint-loading {
		--color: #ffffff;

		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;

		width: 100%;

		background: rgba(0, 0, 0, 0.5);
	}
	.label {
		position: absolute;
		top: 4px;
		right: 4px;
		z-index: 2;

		display: flex;
		place-items: center;

		height: 16px;
		padding: 0 2px;

		color: var(--color);
		font-size: 10px;

		border: 1px solid var(--color);
		border-radius: 2px;
		text-transform: uppercase;

		/* animation: fade 1s ease-in-out infinite; */
	}

	/* .label:before {
		--size: 6px;
		content: '';

		width: var(--size);
		height: var(--size);
		margin: 0 3px 0 1px;

		background-color: var(--color);
		border-radius: 50%;

		animation: fade 1s ease-in-out infinite;
	} */

	@keyframes fade {
		0% {
			opacity: 0;
		}

		50% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}
</style>
