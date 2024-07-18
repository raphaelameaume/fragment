<script>
	import { sketchesManager } from '../state/sketches.svelte.js';
	import { monitors, rendering } from '../stores/rendering';
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import OutputParams from '../ui/ParamsOutput.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';

	let { id, hasHeader = true, output = true } = $props();

	let sketchKey = $derived(sketchesManager.keys[0]);
	let sketch = $derived(sketchesManager.sketches[sketchKey]);
	let framerate = $derived(sketch.framerate);
	let sketchProps = $derived(sketch.props);
	let showOutputParams = true;
</script>

<Module {id} {hasHeader} name={`Parameters`} slug="params">
	<!-- <div slot="header-right">
		{#if options.length > 1}
			<ModuleHeaderAction
				value={selected}
				permanent
				border
				on:change={(event) => (selected = event.detail)}
				{options}
			/>
		{/if}
	</div> -->
	{#if showOutputParams && output}
		<OutputParams />
	{/if}

	{#if sketch}
		{#if typeof sketchProps === 'object'}
			{#if output}
				<Field key="framerate" value={framerate} disabled />
			{/if}
			{#if sketch.duration && sketch.duration > 0 && output}
				<Field
					key="duration"
					value={sketch.duration}
					params={{ suffix: 's', step: 0.1 }}
					disabled
				/>
			{/if}
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
				{#if typeof hidden === 'function' ? !hidden() : !hidden}
					<Field
						context={sketchKey}
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
							sketchProps[key].value._refresh = true;
						}}
						onchange={(value) => {
							sketch.updateProp(key, value);
						}}
					/>
				{/if}
			{/each}
		{/if}
	{/if}
</Module>
