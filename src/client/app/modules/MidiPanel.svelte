<script>
	import { onMount } from 'svelte';
	import Module from '../ui/Module.svelte';
	import Field from '../ui/Field.svelte';
	import MIDI from '../inputs/MIDI.js';

	let { mID, headless = false, ...restProps } = $props();

	let input = $state(undefined);
	let output = $state(undefined);
	let inputs = $state(MIDI.inputs);
	let outputs = $state(MIDI.outputs);
	let inputOptions = $derived.by(() => createDeviceOptions(inputs));
	let outputOptions = $derived.by(() => createDeviceOptions(outputs));
	let messages = $state([]);

	function createDeviceOptions(deviceMap = new Map()) {
		let options = [];

		if (deviceMap.size !== 0) {
			options.push({ value: undefined, label: 'No device selected.' });
		}

		for (let entry of deviceMap) {
			let device = entry[1];
			const { id, name, manufacturer } = device;

			options.push({
				value: id,
				label: `${manufacturer} ${name} – id: ${id}`,
			});
		}

		if (options.length === 0) {
			options.push({ value: undefined, label: 'No device detected.' });
		}

		return options;
	}

	$effect(() => {
		MIDI.selectedInputID = input;
		MIDI.selectedOutputID = output;
	});

	onMount(async () => {
		await MIDI.request();

		function refresh() {
			inputs = MIDI.inputs;
			outputs = MIDI.outputs;

			// if a single device is connected, select it by default
			input =
				inputs.size === 1
					? MIDI.inputs.values().next().value.id
					: undefined;
			output =
				outputs.size === 1
					? MIDI.outputs.values().next().value.id
					: undefined;
		}

		MIDI.addEventListener('connected', () => {
			refresh();
		});
		MIDI.addEventListener('disconnected', () => {
			refresh();
		});

		MIDI.addEventListener('message', (event) => {
			const { type, note, channel, value } = event;
			let date = new Date();
			let time = `${date.getHours()}:${String(date.getMinutes()).padStart(
				2,
				'0',
			)}:${String(date.getSeconds()).padStart(2, '0')}`;

			let noteLog = ['noteon', 'noteoff'].includes(type)
				? ` note:${note.name}`
				: ``;

			messages.push(`${time} ${type} number:${note.number}${noteLog}`);
		});

		refresh();
	});
</script>

<Module {headless} name="MIDI" {...restProps} slug="midi">
	<Field
		key="inputs"
		value={input}
		onchange={(value) => (input = value)}
		params={{
			options: inputOptions,
		}}
	/>
	<Field
		key="outputs"
		value={output}
		onchange={(value) => (output = value)}
		params={{
			options: outputOptions,
		}}
	/>
	<Field key="messages" value={messages} type="list" disabled />
</Module>
