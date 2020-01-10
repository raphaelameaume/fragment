<Panel width={width} title="Input Settings" direction="column">
	<Dropdown title="MIDI">
		<Field prop={propMIDI} name={propMIDI.name} />
    </Dropdown>
    <Dropdown title="Audio">
        <Field prop={propInputMicro} name={propInputMicro.name} />
        <Field prop={propInputPlaylist} name={propInputPlaylist.name}>
            <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickPrev}>Prev</Button>
            <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickPlay}>{propInputPlaylist.labelPlay}</Button>
            <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickNext}>Next</Button>
            <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickLoad}>Load</Button>
            <input type="file" name="load" style="display: none" bind:this={propInputPlaylist.input} on:change={propInputPlaylist.handleUpload} accept="audio/mp3, audio/wav"/>
        </Field>
        <Field prop={{ min: 0, max: 1, value: 0.500, step: 0.001, onChange: ({ value }) => { Audio.setGlobalVolume(value)} }} name="volume" />
        <Field prop={{ min: 0, max: 1000, value: 300 }} name="hold" />
        <Field prop={{ min: 0, max: 1, value: 0.992 }} name="decay" />
        <Field prop={{ min: 0, max: 1, value: 0.1 }} name="min" />
    </Dropdown>
    <Dropdown title="Video">
        <Field prop={propInputWebcam} name={propInputWebcam.name} />
    </Dropdown>
    
</Panel>

<script>
import Panel from "./Panel.svelte";
import Button from "./Button.svelte";
import Field from "./Field.svelte";
import Dropdown from "./Dropdown.svelte";
import { Audio } from "../core/Audio.js";
import { Webcam } from "../core/Webcam.js";
import { Microphone } from "../core/Microphone.js";

// props
export let width;

// reactive

// propes
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
	type: "list",
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

let propMIDI = {
	name: "device",
	type: "select",
	value: [
		{ key: 'none', value: 'No device selected' }
	]
}

</script>

<style>
</style>