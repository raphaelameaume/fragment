<script>
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import OutputParams from '../ui/ParamsOutput.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import { rendering } from '../state/rendering.svelte.js';

	let {
		id,
		headless = false,
		output = true,
		params = $bindable({}),
	} = $props();

	let render = $derived(rendering.renders[0]);
	let sketch = $derived(render?.sketch);
	let sketchProps = $derived(sketch?.props ?? {});
	let sketchPropsGroups = $derived(sketch?.propsGroups ?? []);
	let framerate = $derived(
		isFinite(sketch.fps) ? sketch.fps : rendering.refreshRate,
	);

	let sketchGroupOptions = $derived(
		[
			{ value: '', label: 'all ' },
			sketchPropsGroups.length > 0 && output
				? { value: 'output', label: 'output' }
				: undefined,
			...sketchPropsGroups.map((group) => ({
				value: group,
				label: group,
			})),
		].filter((group) => group !== undefined),
	);
	let sketchPropGroup = $derived(
		sketchGroupOptions
			.map((opt) => opt.value)
			.includes(params.sketchPropGroup)
			? params.sketchPropGroup
			: sketchGroupOptions[0].value,
	);
</script>

<Module {id} {headless} name={`Parameters`} slug="params">
	{#snippet headerRight()}
		{#if sketchGroupOptions.length > 1}
			<ModuleHeaderAction
				value={sketchPropGroup}
				permanent
				border
				onchange={(event) => {
					params.sketchPropGroup = event.currentTarget.value;
				}}
				options={sketchGroupOptions}
			/>
		{/if}
	{/snippet}
	{#if (!sketchPropGroup || sketchPropGroup === 'output') && output}
		<OutputParams />
	{/if}

	{#if sketch}
		{#if !sketchPropGroup && output && sketch}
			<Field
				key="framerate"
				value={framerate}
				disabled
				params={{
					suffix: isFinite(sketch.fps) ? undefined : ' (native)',
				}}
			/>
			{#if sketch.duration && sketch.duration > 0 && output}
				<Field
					key="duration"
					value={sketch.duration}
					params={{ suffix: 's', step: 0.1 }}
					disabled
				/>
			{/if}
		{/if}
		{#if typeof sketchProps === 'object'}
			{#each Object.keys(sketchProps) as key, index (key)}
				{@const sketchProp = sketchProps[key]}
				{@const {
					hidden,
					displayName,
					value,
					type,
					disabled,
					__initialValue: initialValue,
				} = sketchProp}
				{@const isDisabled =
					typeof disabled === 'function' ? disabled() : disabled}
				{#if !hidden}
					{#if !sketchPropGroup || sketchProp.group === sketchPropGroup}
						<Field
							context={sketch.key}
							{key}
							{displayName}
							{value}
							{initialValue}
							{type}
							{index}
							disabled={isDisabled}
							bind:params={sketchProps[key].params}
							triggers={sketchProp.triggers}
							onclick={() => {
								rendering.invalidate(sketch.key);
							}}
							onchange={(v) => {
								sketch.updateProp(key, v);
								rendering.invalidate(sketch.key);
							}}
						/>
					{/if}
				{/if}
			{/each}
		{/if}
	{/if}
</Module>
