<Field prop={propMidiDevice} name={propMidiDevice.name}>
    <Button onClick={handleClickRefresh}>Refresh<IconRefresh/></Button>
</Field>
<Field prop={propMidiMessages} name={propMidiMessages.name} disabled={true}></Field>

<script>
import Field from "../Field.svelte";
import Button from "../Button.svelte";
import IconRefresh from "../svg/IconRefresh.svelte";
import { Midi } from "../../core/Midi.js";

let propMidiDevice = {
	name: "device",
	type: "select",
	input: null,
	options: createDevicesList(),
	onChange: ({ key }) => {
		// let deviceName = key;

		// for (let i = 0; i < Midi.configs.length; i++) {
		// 	console.log(Midi.configs[i].name, deviceName);
		// 	if (Midi.configs[i].name === deviceName) {
		// 		config = Midi.configs[i];
				
		// 		break;
		// 	}
		// }
	},
};

let propMidiMessages = {
	name: 'messages',
	type: 'list',
	value: [],
};

function createDevicesList() {
	if (Midi.inputs.length === 0) {
		return [
			{ key: 'none', label: 'No device detected' }
		]
	} else {
		return [
			...Midi.inputs.map( input => ({ key: input.name, label: `${input.name}`})),
		];
	}
}

function handleClickRefresh() {
	Midi.refresh();

	propMidiDevice.value = createDevicesList();
}

Midi.loadDevices(() => {
	propMidiDevice.value = createDevicesList();

	if (Midi.inputs.length > 0) {
		Midi.setInput(Midi.inputs[0]);
	}
});

Midi.noteon('*').onTrigger(e => {
	let device = e.target.name;
	let note = e.note.name;
	let number = e.note.number;
	let octave = e.note.octave;
	let channel = e.channel;

	let event = `k(${number}) n(${note}) o(${octave}) c(${channel}) from ${device}`;

	let messages = [...propMidiMessages.value];

	if (messages.length >= 4) {
		messages.splice(0, 1);
	}

	messages.push({ value: event });

	propMidiMessages.value = messages;
});
</script>