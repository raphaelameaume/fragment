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

	let sketchFieldsTree = $derived.by(() => {
		let fieldgroups = [];
		let tree = [];

		const getElementFromRef = (ref, part = tree) => {
			let element;

			for (let i = 0; i < part.length; i++) {
				if (part[i] === ref) {
					element = part[i];
					break;
				}

				if (part[i]?.children?.length > 0) {
					for (let j = 0; j < part[i].children.length; j++) {
						element = getElementFromRef(ref, part[i].children[j]);

						if (element) {
							break;
						}
					}
				}
			}

			return element;
		};

		Object.keys(sketchProps).forEach((key) => {
			const sketchProp = sketchProps[key];
			const { folder } = sketchProp;

			if (folder) {
				let names = folder.split('.');

				for (let i = 0; i < names.length; i++) {
					let name = names[i];
					let depth = i;
					let parentName = i > 0 ? names[i - 1] : undefined;
					let parent = parentName
						? fieldgroups.find(
								(f) =>
									f.displayName === parentName &&
									f.depth === depth - 1,
							)
						: undefined;

					let fieldgroup = fieldgroups.find(
						(f) =>
							f.displayName === name &&
							f.depth === depth &&
							f.parent === parent,
					);

					if (!fieldgroup) {
						fieldgroup = {
							type: 'fieldgroup',
							displayName: name,
							collapsed: false,
							children: [],
							parent,
							depth,
						};

						if (parent) {
							parent.children.push(fieldgroup);
						}
						fieldgroups.push(fieldgroup);

						if (depth === 0) {
							tree.push(fieldgroup);
						}
					}

					if (i === names.length - 1) {
						fieldgroup.children.push({
							type: 'field',
							ref: sketchProp,
							key,
						});
					}
				}
			} else {
				tree.push({
					type: 'field',
					ref: sketchProp,
					key,
				});
			}
		});

		return tree;
	});

	$effect(() => {
		console.log(sketchFieldsTree);
	});

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
					{#if !sketchPropGroup || prop.group === sketchPropGroup}
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
				{/if}
			{/snippet}
			{#snippet sketchTreeItem(index, item)}
				{#if item.type === 'field'}
					{@render sketchField(index, item.key, item.ref)}
				{:else if item.type === 'fieldgroup'}
					<FieldGroup
						name={item.displayName}
						collapsed={item.collapsed}
					>
						{#if item.children.length > 0}
							{#each item.children as child, childIndex}
								{@render sketchTreeItem(childIndex, child)}
							{/each}
						{/if}
					</FieldGroup>
				{/if}
			{/snippet}
			{#each sketchFieldsTree as sketchFieldTreeItem, index}
				{@render sketchTreeItem(index, sketchFieldTreeItem)}
			{/each}
		{/if}
	{/if}
</Module>
