<script>
	import { getContext } from 'svelte';
	import { layout } from '../state/layout.svelte.js';
	import { resize } from '../actions/resize.js';

	let {
		id,
		name,
		slug = name,
		scrollable = true,
		headless = false,
		children,
		headerLeft,
		headerRight,
		onresize,
	} = $props();

	const parent = getContext('parent');
	const minimize = getContext('minimize');

	const current = layout.createComponent({
		id,
		type: 'module',
		name: slug,
		headless,
		origin: parent,
	});
</script>

<div
	class="module module--{slug}"
	class:scrollable
	class:headless
	class:editing={layout.editing}
	bind:this={current.node}
>
	{#if !headless && name}
		<header class="module__header" onclick={minimize}>
			<div class="header__col">
				<div class="slot slot--left">
					{@render headerLeft()}
				</div>
			</div>
			<div class="header__col">
				<h2 class="module__title">{name}</h2>
			</div>
			<div class="header__col">
				<div class="slot slot--right">
					{@render headerRight()}
					<!-- <slot name="header-right" /> -->
				</div>
			</div>
		</header>
	{/if}
	<div class="module__container" use:resize={onresize}>
		{@render children()}
	</div>
</div>

<style>
	.module {
		--header-height: 25px;

		display: grid;
		grid-template-rows: 25px minmax(0px, auto);
		grid-template-columns: minmax(0, 1fr);
		align-items: stretch;
	}

	.module.headless {
		--header-height: 0px;
		grid-template-rows: minmax(0px, auto);
	}

	.module__header {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		height: var(--header-height);
		flex-shrink: 0;
		align-items: center;

		background-color: var(--color-lightblack);
	}

	.slot {
		display: flex;
		align-items: center;
	}

	.header__col {
		display: flex;
		padding: 0 6px;
		justify-content: center;
		align-items: center;
	}

	.header__col:first-child {
		justify-content: flex-start;
	}

	.header__col:last-child {
		justify-content: flex-end;
	}

	.module__title {
		user-select: none;

		color: white;
		font-size: 10px;
		text-transform: capitalize;
		background-color: transparent;
	}

	.module__container {
		position: relative;

		background-color: var(--color-background);
	}

	.module.scrollable .module__container {
		overflow-y: auto;
	}

	.module.editing.scrollable .module__container {
		overflow-y: hidden;
	}

	.module__container::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}

	.module__container::-webkit-scrollbar-track {
		background: transparent; /* color of the tracking area */
	}

	.module__container::-webkit-scrollbar-thumb {
		background-color: var(--color-active); /* color of the scroll thumb */
		border-radius: 20px; /*       roundness of the scroll thumb*/
	}

	.module.minimized .module__container {
		display: none;
	}

	.footer {
		height: var(--height-input);
	}
</style>
