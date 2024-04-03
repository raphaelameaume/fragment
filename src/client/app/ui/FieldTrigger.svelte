<script context="module">
	import { TRIGGERS as TRIGGERS_MOUSE } from '../triggers/Mouse.js';
	import { TRIGGERS as TRIGGERS_KEYBOARD } from '../triggers/Keyboard.js';
	import { TRIGGERS as TRIGGERS_AUDIO } from '../triggers/Audio.js';
	import { TRIGGERS as TRIGGERS_MIDI } from '../triggers/MIDI.js';

	const inputs = {
		Mouse: TRIGGERS_MOUSE,
		Keyboard: TRIGGERS_KEYBOARD,
		MIDI: TRIGGERS_MIDI,
		Audio: TRIGGERS_AUDIO,
	};

	const events = Object.keys(inputs)
		.map((key) => inputs[key])
		.map((triggers) => Object.keys(triggers).map((key) => triggers[key]))
		.flat();
</script>

<script>
	import IconCross from '../components/IconCross.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';
	import FieldInputRow from './fields/FieldInputRow.svelte';
	import Select from './fields/Select.svelte';

	import * as triggersMap from '../triggers/index.js';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import FieldTriggerMouse from './FieldTriggerMouse.svelte';
	import FieldTriggerMidi from './FieldTriggerMIDI.svelte';
	import FieldTriggerKeyboard from './FieldTriggerKeyboard.svelte';
	import FieldTriggerAudio from './FieldTriggerAudio.svelte';

	export let index;
	export let inputType = undefined;
	export let eventName = undefined;
	export let enabled = true;
	export let controllable = false;
	export let triggerable = false;
	export let context;
	export let onTrigger = () => {};
	export let params = {};

	const dispatch = createEventDispatcher();

	let trigger;

	function registerTrigger(triggerName, triggerParams = {}) {
		if (trigger) {
			enabled = trigger.enabled;

			trigger.destroy();
			trigger = null;
		}

		const createTrigger = triggersMap[triggerName];

		if (createTrigger) {
			// assign for binding
			eventName = triggerName;
			params = triggerParams;

			trigger = createTrigger(onTrigger, {
				...triggerParams,
				context,
				hot: false,
				enabled,
			});
		}
	}

	function onTypeChange(event) {
		inputType = event.detail;

		if (!eventOptions.includes(eventName)) {
			eventName = undefined;
			params = {};
		}

		if (trigger) {
			trigger.destroy();
			trigger = null;
		}
	}

	function onTriggerChange(e) {
		const { eventName, ...params } = e.detail;

		registerTrigger(eventName, params);
	}

	function handleClickDelete() {
		dispatch('delete', index);
	}

	function toggleTrigger() {
		if (trigger) {
			trigger.enabled = !trigger.enabled;
			enabled = trigger.enabled;
		}
	}

	$: event = events.find((e) => e.name === eventName);
	$: isValid = event
		? event.validate
			? event.validate(eventName, params)
			: true
		: false;

	onMount(() => {
		if (isValid) {
			registerTrigger(eventName, params);
		}
	});

	onDestroy(() => {
		trigger?.destroy();
	});

	$: validInputs = [...Object.keys(inputs)].reduce((all, inputName) => {
		const input = inputs[inputName];
		const events = Object.keys(input).map((key) => input[key]);
		const filteredEvents = events.filter((event) => {
			return (
				event.triggerable === triggerable &&
				event.controllable === controllable
			);
		});

		if (filteredEvents.length > 0) {
			all[inputName] = filteredEvents;
		}

		return all;
	}, {});

	$: inputOptions = [
		{ label: 'Select input', value: undefined, disabled: true },
		...Object.keys(validInputs).map((inputName) => ({
			value: inputName,
		})),
	];

	$: eventOptions = inputType
		? [
				{ label: '-', value: undefined, disabled: true },
				...validInputs[inputType].map((event) => ({
					value: event.name,
				})),
			]
		: [];
</script>

<div class="field-trigger" class:input-selected={inputType !== undefined}>
	<FieldInputRow>
		<button
			class="activity"
			class:valid={isValid}
			class:enabled={trigger && trigger.enabled}
			class:disabled={!trigger || !trigger.enabled}
			on:click={toggleTrigger}
		>
			<span class="visually-hidden">toggle</span>
		</button>
		<Select
			name="trigger-input"
			value={inputType}
			options={inputOptions}
			on:change={onTypeChange}
		/>
		{#if inputType === 'Mouse'}
			<FieldTriggerMouse
				{eventName}
				{eventOptions}
				on:change={onTriggerChange}
			/>
		{:else if inputType === 'Keyboard'}
			<FieldTriggerKeyboard
				{eventName}
				{eventOptions}
				{params}
				on:change={onTriggerChange}
			/>
		{:else if inputType === 'MIDI'}
			<FieldTriggerMidi
				{eventName}
				{eventOptions}
				{params}
				on:change={onTriggerChange}
			/>
		{:else if inputType === 'Audio'}
			<FieldTriggerAudio
				{eventName}
				{eventOptions}
				{params}
				on:change={onTriggerChange}
			/>
		{/if}
		<ButtonInput
			label="delete"
			showLabel={false}
			on:click={handleClickDelete}
			--color-text="white"
			--background-color="var(--color-red)"
			--box-shadow-color-active="var(--color-lightred)"
		>
			<IconCross />
		</ButtonInput>
	</FieldInputRow>
</div>

<style>
	.field-trigger {
		--width-delete: var(--height-input);
		--width-input: 90px;
		--width-activity: 16px;
		--grid-template-columns: var(--width-activity) auto var(--width-delete);
		--align-items: start;

		width: 100%;
		padding: 0 3px;
	}

	.field-trigger:first-child {
		padding-top: 3px;
	}

	.field-trigger:not(:last-child) {
		padding-bottom: 3px;
		margin-bottom: 3px;
		border-bottom: 1px solid var(--color-spacing);
	}

	.field-trigger.input-selected {
		--grid-template-columns: var(--width-activity) var(--width-input) auto
			var(--width-delete);
	}

	.activity {
		--background-color: rgba(255, 255, 255, 0.5);

		position: relative;

		width: var(--width-activity);
		height: var(--height-input);
		margin: 2px 0;

		background-color: transparent;
	}

	.activity:before {
		--size: 4px;

		content: '';

		position: absolute;
		top: calc(50% - var(--size) * 0.5);
		left: calc(50% - var(--size) * 0.5);

		width: var(--size);
		height: var(--size);
		border-radius: 2px;

		background-color: var(--background-color);
	}

	.activity.valid.enabled {
		--background-color: var(--color-green);
	}

	.activity.valid.disabled {
		--background-color: var(--color-red);
	}
</style>
