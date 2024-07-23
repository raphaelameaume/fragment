<script context="module">
	const inputs = {
		Mouse: {
			events: [
				{ name: 'onMouseDown', triggerable: true, controllable: false },
				{ name: 'onMouseUp', triggerable: true, controllable: false },
				{ name: 'onMouseMove', triggerable: true, controllable: false },
				{ name: 'onClick', triggerable: true, controllable: false },
			],
		},
		Keyboard: {
			events: [
				{ name: 'onKeyDown', triggerable: true, controllable: false },
				{ name: 'onKeyPress', triggerable: true, controllable: false },
				{ name: 'onKeyUp', triggerable: true, controllable: false },
			],
		},
		MIDI: {
			events: [
				{ name: 'onNoteOn', triggerable: true, controllable: false },
				{ name: 'onNoteOff', triggerable: true, controllable: false },
				{ name: 'onNumberOn', triggerable: true, controllable: false },
				{ name: 'onNumberOff', triggerable: true, controllable: false },
				{
					name: 'onControlChange',
					triggerable: false,
					controllable: true,
				},
			],
		},
	};
</script>

<script>
	import IconCross from '../components/IconCross.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';
	import FieldInputRow from './fields/FieldInputRow.svelte';
	import Select from './fields/Select.svelte';
	import TextInput from './fields/TextInput.svelte';
	import * as triggersMap from '../triggers/index.js';
	import { onMount } from 'svelte';

	let {
		index,
		inputType,
		eventName,
		enabled,
		controllable = false,
		triggerable = false,
		context,
		onchange = () => {},
		onTrigger = () => {},
		onDelete = () => {},
		params = { key: [] },
	} = $props();

	let validInputs = $derived.by(() =>
		[...Object.keys(inputs)].reduce((all, inputName) => {
			const input = inputs[inputName];
			const { disabled, events } = input;
			const filteredEvents = events.filter((event) => {
				return (
					event.triggerable === triggerable &&
					event.controllable === controllable
				);
			});

			if (filteredEvents.length > 0) {
				all[inputName] = { events: filteredEvents, disabled };
			}

			return all;
		}, {}),
	);

	let inputOptions = $derived([
		{ label: 'Select input', value: undefined, disabled: true },
		...Object.keys(validInputs).map((inputName) => ({
			value: inputName,
			disabled: validInputs[inputName].disabled,
		})),
	]);

	let eventOptions = $derived(
		inputType
			? [
					{ label: '-', value: undefined, disabled: true },
					...validInputs[inputType].events.map((event) => ({
						value: event.name,
					})),
				]
			: [],
	);

	let isValid = $derived(inputType && eventName);
	let key = $derived(params.key);
	let trigger;

	function registerTrigger() {
		let wasEnabled = trigger?.enabled;
		if (trigger) {
			trigger.destroy();
			trigger = null;
		}

		const createTrigger = triggersMap[eventName];

		trigger = createTrigger(onTrigger, {
			...$state.snapshot(params),
			context,
			hot: false,
			enabled: wasEnabled,
		});

		onchange(index, trigger);
	}

	function onTypeChange(value) {
		inputType = value;

		if (!eventOptions.includes(eventName)) {
			eventName = undefined;
			params.key = null;
		}

		if (trigger) {
			trigger.destroy();
			trigger = null;
		}
	}

	function onEventChange(value) {
		const clearParams =
			inputType === 'MIDI' &&
			eventName !== undefined &&
			((eventName.includes('Number') && value.includes('Note')) ||
				(eventName.includes('Note') && value.includes('Number')));

		eventName = value;

		if (clearParams) {
			params.key = '';
		}

		if (inputType === 'Mouse' || inputType === 'Keyboard') {
			registerTrigger();
		}
	}

	function onTextChange(event) {
		params.key = event.currentTarget.value;

		registerTrigger();
	}

	function handleClickDelete() {
		onDelete(index);
	}

	function toggleTrigger() {
		if (trigger) {
			trigger.enabled = !trigger.enabled;
			registerTrigger();
		}
	}

	onMount(() => {
		if (isValid) {
			registerTrigger();
		}

		return () => {
			trigger?.destroy();
			trigger = null;
		};
	});
</script>

<div class="field-trigger {inputType ? inputType.toLowerCase() : ''}">
	<FieldInputRow
		--grid-template-columns="var(--width-activity) var(--width-cols) var(--width-delete)"
	>
		<button
			class="activity"
			class:valid={isValid}
			class:enabled
			class:disabled={!enabled}
			onclick={toggleTrigger}
		></button>
		<Select
			name="trigger-input"
			value={inputType}
			options={inputOptions}
			onchange={onTypeChange}
		/>
		{#if inputType}
			<Select
				options={eventOptions}
				value={eventName}
				disabled={inputType === undefined}
				onchange={onEventChange}
			/>
		{/if}
		{#if inputType === 'Keyboard'}
			<TextInput value={key} label="key" oninput={onTextChange} />
		{/if}
		{#if inputType === 'MIDI'}
			<TextInput
				value={key}
				label={['onNoteOn', 'onNoteOff'].includes(eventName)
					? 'note'
					: 'number'}
				oninput={onTextChange}
			/>
		{/if}
		<ButtonInput
			label="delete"
			showLabel={false}
			onclick={handleClickDelete}
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
		--width-cols: 1fr;

		width: 100%;
	}

	.activity {
		--background-color: rgba(255, 255, 255, 0.5);

		position: relative;

		width: var(--width-activity);
		height: 100%;

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

	.field-trigger.mouse {
		--width-cols: var(--width-input) 1fr;
	}

	.field-trigger.keyboard,
	.field-trigger.midi {
		--width-cols: var(--width-input) 1fr 0.75fr;
	}
</style>
