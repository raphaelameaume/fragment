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
	import { onMount } from 'svelte';
	import IconCross from '../components/IconCross.svelte';
	import ButtonInput from './fields/ButtonInput.svelte';
	import FieldInputRow from './fields/FieldInputRow.svelte';
	import FieldGroup from './FieldGroup.svelte';
	import Field from './Field.svelte';
	import FieldTriggerMouse from './FieldTriggerMouse.svelte';
	import FieldTriggerKeyboard from './FieldTriggerKeyboard.svelte';
	import FieldTriggersMIDI from './FieldTriggersMIDI.svelte';

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

	let trigger = $state(undefined);
	let name = $derived.by(() => {
		let name = 'Trigger';

		if (inputType) {
			name = inputType;
		}

		if (eventName) {
			name += ` — ${eventName}`;
		}

		return name;
	});

	function registerTrigger(createTrigger, params = {}) {
		let wasEnabled = enabled;

		if (trigger) {
			trigger.destroy();
			trigger = null;
		}

		trigger = createTrigger(onTrigger, {
			params,
			context,
			hot: false,
			enabled: wasEnabled,
		});

		onchange(index, trigger);
	}

	function onTypeChange(value) {
		inputType = value;

		if (trigger) {
			trigger.destroy();
			trigger = null;
		}
	}

	function handleClickDelete() {
		onDelete(index);
	}

	function toggleTrigger(value) {
		trigger.enabled = value;
		onchange(index, trigger);
	}

	onMount(() => {
		return () => {
			trigger?.destroy();
			trigger = null;
		};
	});
</script>

<div class="field-trigger {inputType ? inputType.toLowerCase() : ''}">
	<FieldInputRow --grid-template-columns="var(--width-cols)">
		<div class="delete">
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
		</div>
		<FieldGroup {name}>
			<Field
				key="input"
				value={inputType}
				params={{
					options: inputOptions,
				}}
				onchange={onTypeChange}
			/>
			{#if inputType === 'Mouse'}
				<FieldTriggerMouse
					event={eventName}
					{registerTrigger}
					{enabled}
				/>
			{/if}
			{#if inputType === 'Keyboard'}
				<FieldTriggerKeyboard
					event={eventName}
					{registerTrigger}
					{enabled}
					{params}
				/>
			{/if}
			{#if inputType === 'MIDI'}
				<FieldTriggersMIDI
					event={eventName}
					{registerTrigger}
					{enabled}
					{params}
					{controllable}
					{triggerable}
				/>
			{/if}
			{#if trigger}
				<Field
					key="enabled"
					value={trigger?.enabled}
					onchange={toggleTrigger}
				/>
			{/if}
		</FieldGroup>
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

	.delete {
		position: absolute;
		top: 5px;
		right: calc(var(--column-gap) * 2);
		z-index: 1;
	}
</style>
