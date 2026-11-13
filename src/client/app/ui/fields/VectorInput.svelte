<script>
	import FieldInputRow from './FieldInputRow.svelte';
	import NumberInput from './NumberInput.svelte';

	let {
		value,
		suffix = '',
		min = -Infinity,
		max = Infinity,
		step = 0.1,
		key,
		locked = false,
		disabled = false,
		context = null,
		onchange,
	} = $props();

	const keysChecks = ['x', 'y', 'z', 'w'];

	let isArray = $derived(Array.isArray(value));
	let isObject = $derived(!isArray && typeof value === 'object');
	let keys = $derived.by(() => {
		let keys = [];

		if (isArray) {
			return value.map((_, index) => index);
		}

		if (!isArray && !isObject) return [0];

		for (let i = 0; i < keysChecks; i++) {
			let keyCheck = keysChecks[i];

			if (keyCheck in value) {
				keys.push(keyCheck);
			}
		}

		if (value.isVector2) {
			return ['x', 'y'];
		}

		if (value.isVector3) {
			return ['x', 'y', 'z'];
		}

		if (value.isVector4 || value.isQuaternion) {
			return ['x', 'y', 'z', 'w'];
		}

		if (isObject) {
			return Object.keys(value);
		}

		return keys;
	});
	let components = $derived.by(() => {
		if (!isObject && !isArray) {
			return [value];
		}

		return keys.map((key) => value[key]);
	});
	let mins = $derived(keys.map((key) => min[key]));
	let maxs = $derived(keys.map((key) => max[key]));
	let steps = $derived(keys.map((key) => step[key]));

	function dispatchChange() {
		let clone = isArray ? [] : {};

		keys.forEach((key, index) => {
			clone[key] = components[index];
		});

		onchange(clone);
	}

	function handleComponentChange(newValue, componentIndex) {
		let ratio = newValue / components[componentIndex];

		if (!isFinite(ratio)) {
			ratio = 1;
		}

		components.forEach((component, index) => {
			components[index] =
				index === componentIndex
					? newValue
					: locked
						? Math.round(component * ratio * (1 / step)) /
							(1 / step)
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
				min={mins[index]}
				max={maxs[index]}
				step={steps[index]}
				{suffix}
				{disabled}
				{context}
				{key}
				label={keys[index]}
				value={component}
				onchange={(value) => handleComponentChange(value, index)}
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

		background-color: var(--fragment-input-border-color);
	}
</style>
