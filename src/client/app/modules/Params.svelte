<script>
	import { sketchesManager } from '../state/sketches.svelte.js';

	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import OutputParams from '../ui/ParamsOutput.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import { rendering } from '../state/rendering.svelte.js';
	import { layout } from '../state/layout.svelte.js';

	let { id, headless = false, output = true, params = {} } = $props();

	let render = $derived(rendering.renders[0]);
	let sketch = $derived(render?.sketch);
	let sketchProps = $derived(sketch?.props ?? {});
	let sketchPropsGroups = $derived(sketch?.propsGroups ?? []);
	let showOutputParams = true;
	let framerate = $derived(sketch?.fps ?? rendering.refreshRate);

	let sketchGroupOptions = $derived([
		{ value: '', label: 'all ' },
		...sketchPropsGroups.map((group) => ({ value: group, label: group })),
	]);
	let sketchPropGroup = $derived(
		sketchGroupOptions
			.map((opt) => opt.value)
			.includes(params.sketchPropGroup)
			? params.sketchPropGroup
			: sketchGroupOptions[0].value,
	);

	let layoutComponent = $derived(layout.components.find((c) => c.id === id));
</script>

<Module {id} {headless} name={`Parameters`} slug="params">
	{#snippet headerRight()}>
		{#if sketchGroupOptions.length > 1}
			<ModuleHeaderAction
				value={sketchPropGroup}
				permanent
				border
				onchange={(event) => {
					layoutComponent.params.sketchPropGroup =
						event.currentTarget.value;
				}}
				options={sketchGroupOptions}
			/>
		{/if}
	{/snippet}
	{#if !sketchPropGroup && showOutputParams && output}
		<OutputParams />
	{/if}

	{#if sketch}
		{#if !sketchPropGroup && output && sketch}
			<Field
				key="framerate"
				value={framerate}
				disabled
				params={{
					suffix: sketch.fps ? undefined : ' (native)',
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
					group,
					__initialValue: initialValue,
				} = sketchProp}
				{@const isDisabled =
					typeof disabled === 'function' ? disabled() : disabled}
				{#if typeof hidden === 'function' ? !hidden() : !hidden}
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
							onchange={(value) => {
								sketch.updateProp(key, value);
								rendering.invalidate(sketch.key);
							}}
						/>
					{/if}
				{/if}
			{/each}
		{/if}
	{/if}
</Module>
