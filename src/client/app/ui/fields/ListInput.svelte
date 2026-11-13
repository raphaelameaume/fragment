<script>
	import { afterUpdate } from 'svelte';

	export let disabled;
	export let value = null;
	export let context = null;
	export let key = '';

	let container;

	afterUpdate(() => {
		container.scrollTo(0, container.scrollHeight);
	});
</script>

<div class="list" class:disabled>
	<div class="container" bind:this={container}>
		<ul class="ul">
			{#each value as item, index}
				<li class="item">
					{#if disabled}
						<span class="label">{item}</span>
					{:else}
						<button class="label">{item}</button>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.list {
		width: 100%;

		pointer-events: auto;
	}

	.container {
		margin-right: var(--padding);
		padding: 1px 0;
		height: 80px;

		background-color: #1d1d1e;
		border-radius: var(--fragment-input-border-radius);
		box-shadow: inset 0 0 0 1px var(--fragment-input-border-color);
		overflow-y: scroll;
	}

	.ul {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 2px 0;
	}

	.container::-webkit-scrollbar {
		width: 5px; /* width of the entire scrollbar */
	}

	.container::-webkit-scrollbar-track {
		background-color: var(
			--fragment-color-lightblack
		); /* color of the tracking area */
	}

	.container::-webkit-scrollbar-thumb {
		background-color: var(
			--fragment-accent-color
		); /* color of the scroll thumb */
		border-radius: 20px; /* roundness of the scroll thumb */
	}

	.item {
		display: flex;
		width: 100%;

		margin: 0;
		padding: 0 3px;
		color: var(--fragment-text-color);
		font-size: 10px;

		opacity: 0.35;
		user-select: none;
	}

	.label {
		width: 100%;
		padding: 1px var(--padding);
		background-color: transparent;
		text-align: left;
	}

	.list:not(.disabled) .label:hover {
		box-shadow: inset 0 0 0 1px var(--fragment-accent-color);
	}

	.list:not(.disabled) .label:active {
		box-shadow: 0 0 0 2px var(--fragment-accent-color);
	}

	.item:hover {
		opacity: 1;
	}

	/* :global(.field:hover) .list:not(.disabled) .item {
    opacity: 1;
} */
</style>
