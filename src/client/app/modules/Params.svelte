<script context="module">
	import { writable } from 'svelte/store';

	export const params = writable([]);

	let ID = 0;
</script>

<script>
	import { onMount, onDestroy } from 'svelte';
	import { sketches, sketchesKeys } from '../state/sketches.svelte.js';
	import { monitors, rendering } from '../stores/rendering';
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import OutputParams from '../ui/ParamsOutput.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import { updateProp, props as sketchesProps } from '../state/props.svelte';

	let { id, hasHeader = true, output = true } = $props();

	let sketchKey = $derived(sketchesKeys[0]);
	let sketch = $derived(sketches[sketchKey]);
	let sketchProps = $derived(sketchesProps[sketchKey]);
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
				<Field
					key="framerate"
					value={isFinite(sketch.fps) ? sketch.fps : 60}
					disabled
				/>
			{/if}
			{#if sketch.duration && sketch.duration > 0 && output}
				<Field
					key="duration"
					value={sketch.duration}
					params={{ suffix: 's' }}
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
						on:click={() => {
							sketchProps[key].value._refresh = true;
						}}
						on:change={(event) => {
							updateProp(sketchKey, key, event.detail, {
								width: $rendering.width,
								height: $rendering.height,
								pixelRatio: $rendering.pixelRatio,
							});
						}}
					/>
				{/if}
			{/each}
		{/if}
	{/if}
</Module>
