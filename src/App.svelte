<script>
import { onMount } from "svelte";
import Renderer from "./core/Renderer.js";
import { Webcam } from "./core/Webcam.js";
import { Microphone } from "./core/Microphone.js";
import { Audio } from "./core/Audio.js";
import Preview from "./ui/Preview.svelte";
import Panel from "./ui/Panel.svelte";
import Select from "./ui/Select.svelte";
import Tabs from "./ui/Tabs.svelte";
import Button from "./ui/Button.svelte";
import TabList from "./ui/TabList.svelte";
import Tab from "./ui/Tab.svelte";
import TabPanel from "./ui/TabPanel.svelte";
import Field from "./ui/Field.svelte";
import Dropdown from "./ui/Dropdown.svelte";


import * as stages from "./stages/index.js";

let list = Object.keys(stages).map(key => ({ key: stages[key].name, value: stages[key].name }));

let { renderer, gl, dimensions } = Renderer();

$: current = {
	stage1: null,
	stage2: null,
};

let instanced = {};

function handleStageChange(id, key) {
	setStage(id, key);
}

function setStage(id, key) {
	if (!instanced[key]) {
		const { scene, name, props } = stages[key];

		stages[key].instance = new scene({
			name,
			gl,
			renderer,
			props,
		});

		instanced[key] = stages[key];
	}

	current[id] = instanced[key];
}

onMount(() => {
	Object.keys(stages).forEach((name, index) => {
		if (index < 2) {
			setStage(`stage${index+1}`, name);
		}
	});
});

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
				// console.log('microphone requested!')
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

</script>

<main>
	<div class="panels">
		<Panel>
			<Preview width={dimensions.width} height={dimensions.height} stage={current.stage1}></Preview>
			<Select options={list} onChange={({ key }) => handleStageChange('stage1', key)}></Select>
		</Panel>
		<Panel>
			<Preview width={dimensions.width} height={dimensions.height} stage={current.stage2}></Preview>
			<Select options={list} onChange={({ key }) => handleStageChange('stage2', key)}></Select>
		</Panel>
	</div>
	<div class="live">
		<Tabs>
			<TabList>
				<Tab>Input</Tab>
				<Tab>Output</Tab>
			</TabList>
			<TabPanel>
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
				<Dropdown title="MIDI">
				</Dropdown>
			</TabPanel>
			<TabPanel>
				<h2>Output controls</h2>
			</TabPanel>
		</Tabs>
	</div>
	<div class="controls">
		<Tabs>
			<TabList>
				<Tab>Stage 1</Tab>
				<Tab>Stage 2</Tab>
			</TabList>
			<TabPanel>
				{#if current.stage1 !== null}
					{#each Object.keys(current.stage1.props) as propKey}
						<Field prop={current.stage1.props[propKey]} name={propKey} />
					{/each}
				{/if}
			</TabPanel>
			<TabPanel>
				{#if current.stage2 !== null}
					{#each Object.keys(current.stage2.props) as propKey}
						<Field prop={current.stage2.props[propKey]} name={propKey} />
					{/each}
				{/if}
			</TabPanel>
		</Tabs>
	</div>
</main>

<style>
main {
	position: relative;

	display: flex;
	height: 100%;
	justify-content: center;
	align-items: center;

	margin: 0 auto;
}

.panels {
	position: absolute;
	left: 0;
	top: 0;

	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	align-items: center;
	width: 40vw;
	height: 100%;
	padding: 0 20px;
}

.live {
	position: absolute;
	top: 0;
	left: 40vw;

	display: flex;
	width: 60vw;
	height: 50vh;

	background-color: #242425;
}

.controls {
	position: absolute;
	top: 50vh;
	left: 40vw;

	width: 60vw;
	height: 50vh;

	background: #242425;
}
</style>