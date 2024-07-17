<script>
	import FieldInputRow from './FieldInputRow.svelte';
	import NumberInput from './NumberInput.svelte';

	let {
		value,
		suffix = '',
		min = -Infinity,
		max = Infinity,
		step = 0.1,
		locked = false,
		disabled = false,
		context = null,
		key = '',
		onchange,
	} = $props();


	let isArray = $derived(Array.isArray(value));
	let isObject = $derived(!isArray && typeof value === 'object');
	let components = $derived(isObject ? Object.values(value) : [...value]);
	let keys = $derived(isObject ? Object.keys(value) : value.map((v, i) => i));

	function dispatchChange() {
		let newValue = keys.reduce((all, key, index) => {
			all[key] = components[index];

			return all;
		}, isArray ? [] : {});

		onchange(newValue);
	}

	function handleComponentChange(newValue, componentIndex) {
		let ratio = newValue / components[componentIndex];

		if (!isFinite(ratio)) {
			ratio = 1;
		}

		components.forEach((component, index) => {
			components[index] = index === componentIndex
				? newValue
				: locked
					? Math.round(component * ratio * (1 / step)) / (1 / step)
					: component;
		});

		dispatchChange();
	}
</script>

<div class="vector-container vec{components.length}" class:locked>
	<FieldInputRow
		--grid-template-columns={components.map(() => '1fr').join(' ')}
	>
		{#each components as component, index}
			<NumberInput
				{min}
				{max}
				{step}
				{suffix}
				{disabled}
				{context}
				{key}
				label={keys[index]}
				value={component}
				onchange={(value) =>
					handleComponentChange(value, index)}
			/>
		{/each}
	</FieldInputRow>
</div>

<style>
	.vector-container {
		width: 100%;
	}

	:global(.vector-container.locked .number-input:not(:last-child):after) {
		content: '';

		position: absolute;
		top: 50%;
		right: calc(var(--column-gap) * -1);
		width: var(--column-gap);
		height: 1px;

		background-color: var(--color-border-input);
	}
</style>
