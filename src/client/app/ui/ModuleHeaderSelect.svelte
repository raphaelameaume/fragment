<script>
	import SelectChevrons from './SelectChevrons.svelte';

	let { value, options = [], disabled = false, onchange } = $props();
</script>

<div class="module-header-select">
	<select
		class="select"
		{onchange}
		class:single={options.length === 1}
		{disabled}
	>
		{#each options as option}
			<option value={option.value} selected={value === option.value}
				>{option.label}</option
			>
		{/each}
	</select>
	{#if options.length > 1}
		<SelectChevrons
			width={15}
			height={15}
			--color="rgba(255, 255, 255, 0.75)"
		/>
	{/if}
</div>

<style>
	.module-header-select {
		position: relative;

		display: flex;
	}

	.select {
		font-size: 10px;
		padding: 1px 3px;

		color: inherit;
		background: transparent;

		outline: 0;
		user-select: none;
	}

	.select:not(.single) {
		padding-right: 15px;
	}
</style>
