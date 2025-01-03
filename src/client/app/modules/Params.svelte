<script>
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import OutputParams from '../ui/ParamsOutput.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import { rendering } from '../state/rendering.svelte.js';
	import FieldGroup from '../ui/FieldGroup.svelte';

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

	let sketchPropsTree = $derived.by(() => {
		const tree = [];

		Object.keys(sketchProps).forEach((key) => {
			const { folder, group } = sketchProps[key];

			if (!sketchPropGroup || group === sketchPropGroup) {
				if (folder) {
					const fieldgroup = sketch?.propsFolders.find(
						(f) => f.id === folder,
					);

					if (fieldgroup) {
						const { depth, root } = fieldgroup;

						if (depth === 0 && !tree.includes(folder)) {
							tree.push(fieldgroup);
						} else if (root && !tree.includes(root)) {
							tree.push(root);
						}
					} else {
						console.warn(
							'Prop cannot be render in undefined fielgroup',
						);
					}
				} else {
					tree.push({
						type: 'field',
						key,
					});
				}
			}
		});

		return tree;
	});
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
			{#snippet sketchField(index, key, prop)}
				{@const {
					hidden,
					displayName,
					value,
					type,
					disabled,
					__initialValue: initialValue,
				} = prop}
				{@const isDisabled =
					typeof disabled === 'function' ? disabled() : disabled}
				{#if !hidden}
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
						triggers={prop.triggers}
						onclick={() => {
							rendering.invalidate(sketch.key);
						}}
						onchange={(v) => {
							sketch.updateProp(key, v);
							rendering.invalidate(sketch.key);
						}}
					/>
				{/if}
			{/snippet}
			{#snippet sketchPropItem(index, item)}
				{#if item.type === 'field'}
					{@render sketchField(
						index,
						item.key,
						sketchProps[item.key],
					)}
				{:else if item.type === 'fieldgroup'}
					<FieldGroup
						name={item.displayName}
						collapsed={item.collapsed}
						onchange={(collapsed) => {
							sketch.updateFolder(item, collapsed);
						}}
					>
						{#if item.children.length > 0}
							{#each item.children as child, childIndex}
								{@render sketchPropItem(childIndex, child)}
							{/each}
						{/if}
					</FieldGroup>
				{/if}
			{/snippet}
			{#each sketchPropsTree as sketchPropsTreeItem, index}
				{@render sketchPropItem(index, sketchPropsTreeItem)}
			{/each}
		{/if}
	{/if}
</Module>
