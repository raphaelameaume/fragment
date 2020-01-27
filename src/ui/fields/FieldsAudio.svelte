<Field prop={propInputMicro} name={propInputMicro.name} url="Microphone" />
<Field prop={propInputPlaylist} name={propInputPlaylist.name} wrap={true}>
    <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickPrev}>Prev</Button>
    <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickPlay}>{propInputPlaylist.labelPlay}</Button>
    <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickNext}>Next</Button>
    <Button style="margin-left: 5px;" onClick={propInputPlaylist.handleClickLoad}>Load</Button>
    <input type="file" name="load" style="display: none" bind:this={propInputPlaylist.input} on:change={propInputPlaylist.handleUpload} accept="audio/mp3, audio/wav"/>
</Field>
<Field prop={{ min: 0, max: 1, value: 0.500, step: 0.001, triggers: [Midi.knob(1)], onChange: ({ value }) => { Audio.setGlobalVolume(value)} }} name="volume" />
<Field prop={{ min: 0, max: 1000, value: 300, triggers: [Midi.knob(2)] }} name="hold" />
<Field prop={{ min: 0, max: 1, value: 0.992, triggers: [Midi.knob(3)] }} name="decay" />
<Field prop={{ min: 0, max: 1, value: 0.1, triggers: [Midi.knob(4)] }} name="min" />

<script>
import Field from "../Field.svelte";
import Button from "../Button.svelte";
import { Audio } from "../../core/Audio.js";
import { Midi } from "../../core/Midi.js";
import { Microphone } from "../../core/Microphone.js";

// prop
let propInputMicro = {
	name: "microphone",
	type: "button",
	label: () => propInputMicro.value ? 'Disable' : 'Enable',
	value: false,
	onChange: () => {
		if (propInputMicro.value) {
			Microphone.request({ onSuccess: (stream) => {
				Audio.attachStream(stream);
			}});
		} else {
			Microphone.stop();
			Audio.detachStream();
		}
	},
	onTrigger: () => {
		propInputMicro.value = !propInputMicro.value;
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
</script>