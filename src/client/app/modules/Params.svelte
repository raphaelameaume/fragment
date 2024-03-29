<script context="module">
	import { writable } from 'svelte/store';

	export const params = writable([]);

	let ID = 0;
</script>

<script>
	import { onMount, onDestroy } from 'svelte';
	import { sketches } from '../stores/sketches.js';
	import { monitors, rendering } from '../stores/rendering';
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import OutputParams from '../ui/ParamsOutput.svelte';
	import ModuleHeaderAction from '../ui/ModuleHeaderAction.svelte';
	import { updateProp, props } from '../stores/props';

	export let mID;
	export let hasHeader = true;
	export let output = true;

	let id = ID++;
	let selected = id;
	let sketch,
		sketchKey,
		sketchProps = {};
	let monitor, showOutputParams;

	onMount(() => {
		$params = [
			...$params,
			{
				id,
			},
		];
	});

	onDestroy(() => {
		$params = $params.filter((p) => p.id !== id);
	});

	$: options = [
		...$monitors.map((monitor, index) => {
			return { value: index, label: `monitor ${index + 1}` };
		}),
		...($params.length > 1 ? [{ value: 'output', label: 'output' }] : []),
	];

	monitors.subscribe((value) => {
		monitor = $monitors[Math.min(selected, $monitors.length - 1)];
		sketchKey = monitor ? monitor.selected : undefined;
	});

	$: {
		sketch = $sketches[sketchKey];
		sketchProps = $props[sketchKey];
	}

	$: showOutputParams =
		(monitor && monitor.selected === 'output') ||
		$params.length === 1 ||
		selected === 'output';
</script>

<Module {mID} {hasHeader} name={`Parameters`} slug="params">
	<div slot="header-right">
		{#if options.length > 1}
			<ModuleHeaderAction
				value={selected}
				permanent
				border
				on:change={(event) => (selected = event.detail)}
				{options}
			/>
		{/if}
	</div>
	{#if showOutputParams && output}
		<OutputParams />
	{/if}

	{#if sketch}
		{#if typeof props === 'object'}
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
							$props[sketchKey][key].value._refresh = true;
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
