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
	let components = $state(isObject ? Object.values(value) : [...value]);
	let keys = $derived(isObject ? Object.keys(value) : value.map(() => undefined));

	function dispatchChange() {
		let needsUpdate = false;
		for (let i = 0; i < components.length; i++) {
			const key = isArray ? i : keys[i];

			if (value[key] !== components[i]) {
				value[key] = components[i];
				needsUpdate = true;
			}
		}

		if (needsUpdate) {
			onchange(value);
		}
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
