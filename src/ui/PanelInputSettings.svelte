<Panel width={width} title="Input Settings" direction="column">
	<Dropdown title="MIDI">
		<FieldsMidi />
    </Dropdown>
    <Dropdown title="Audio">
		<FieldsAudio />
    </Dropdown>
    <Dropdown title="Video">
		<FieldsWebcam />
    </Dropdown>
    
</Panel>

<script>
import Panel from "./Panel.svelte";
import Button from "./Button.svelte";
import Field from "./Field.svelte";
import Checkbox from "./Checkbox.svelte";
import Dropdown from "./Dropdown.svelte";
import IconRefresh from "./svg/IconRefresh.svelte";

import FieldsMidi from "./fields/FieldsMidi.svelte";
import FieldsAudio from "./fields/FieldsAudio.svelte";
import FieldsWebcam from "./fields/FieldsWebcam.svelte";
import { Audio } from "../core/Audio.js";
import { Webcam } from "../core/Webcam.js";
import { Microphone } from "../core/Microphone.js";
import { Midi } from "../core/Midi.js";

// props
export let width;

// prop
let propInputMicro = {
	name: "microphone",
	type: "button",
	label: "Enable",
	enabled: false,
	onTrigger: () => {
		propInputMicro.enabled = !propInputMicro.enabled;
		propInputMicro.label = propInputMicro.enabled ? 'Disable' : 'Enable';

		if (propInputMicro.enabled) {
			Microphone.request({ onSuccess: (stream) => {
				Audio.attachStream(stream);
			}});
		} else {
			
		}
	}
};

let propInputPlaylist = {
	name: "playlist",
	type: "action-list",
	current: 0,
	value: [
		{ value: "sun-models.mp3", src: "assets/sounds/sun-models.mp3" },
	],
	input: null,
	playing: false,
	labelPlay: 'Play',
	onTrigger: ({ value }) => {
		console.log(value);
	},
	handleClickPrev: () => {
		let { current, value } = propInputPlaylist;
		propInputPlaylist.current = current > 0 ? current - 1 : value.length - 1;
	},
	handleClickNext: () => {
		let { current, value, playing } = propInputPlaylist;
		propInputPlaylist.current = (current + 1) % value.length;

		if (playing) {
			propInputPlaylist.handleClickPlay();
		}
	},
	handleClickPlay: () => {
		propInputPlaylist.playing = !propInputPlaylist.playing; 
		propInputPlaylist.labelPlay = propInputPlaylist.playing ? 'Pause' : 'Play';

		if (propInputPlaylist.playing) {
			let { value, current } = propInputPlaylist;
			let filepath = value[current].src;
	
			Audio.play(filepath, { onEnd: () => {
				propInputPlaylist.handleClickNext();
			}});
		} else {
			Audio.pause();
		}
	},
	handleUpload: (event) => {
		let reader = new FileReader();
		let file = event.target.files[0];
		reader.onload = (e) => {
			propInputPlaylist.value = [
				...propInputPlaylist.value,
				{
					value: file.name,
					src: e.target.result,
				}
			];

			Audio.play(e.target.result, { onEnd: () => {
				propInputPlaylist.handleClickNext();
			}});
		};
		reader.readAsDataURL(file);
	},
	handleClickLoad: () => {
		propInputPlaylist.input.click();
	}
};

let propInputWebcam = {
	name: "webcam",
	type: "button",
	label: "Enable",
	enabled: false,
	onTrigger: (prop) => {
		propInputWebcam.enabled = !propInputWebcam.enabled;
		propInputWebcam.label = propInputWebcam.enabled ? 'Disable' : 'Enable';

		if (propInputWebcam.enabled) {
			Webcam.request({ audio: false, onSuccess: () => {
				Webcam.video.style.cssText = 'position: absolute; bottom: 0; left: 0; z-index: 999;';
	
				document.body.appendChild(Webcam.video);
			}});
		} else {

		}
	}
};

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

<style>
</style>