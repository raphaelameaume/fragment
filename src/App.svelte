<main>
	<Panel width="100%" height="72vh" direction="row">
		<Panel title="Stage 1" width="33%" direction="column">
			<div slot="header" class="stage__header" style="">
				<div class="stage__live" style="opacity: {treshold < 1 ? 1 : 0}"></div>
				<Select options={list} value={current.stage1 ? current.stage1.name : ''} onChange={({ key }) => handleStageChange('stage1', key)} />
			</div>
			<Dropdown title="Monitor">
				<Preview width={dimensions.width} height={dimensions.height} stage={current.stage1} index={0} renderer={renderer}></Preview>
			</Dropdown>
			<Dropdown title="Settings">
				{#if current.stage1 !== null}
					{#each Object.keys(current.stage1.props) as propKey}
						<Field prop={current.stage1.props[propKey]} name={propKey} />
					{/each}
				{/if}
			</Dropdown>
		</Panel>
		<Separator />
		<Panel title="Stage 2" width="33%" direction="column">
			<div slot="header" class="stage__header" style="padding-right: 20px;">
				<div class="stage__live" style="opacity: {treshold > 0 ? 1 : 0}"></div>
				<Select options={list} value={current.stage2 ? current.stage2.name : ''} onChange={({ key }) => handleStageChange('stage2', key)} />
			</div>
			<Dropdown title="Monitor">
				<Preview width={dimensions.width} height={dimensions.height} stage={current.stage2} index={1} renderer={renderer}></Preview>
			</Dropdown>
			<Dropdown title="Settings">
				{#if current.stage2 !== null}
					{#each Object.keys(current.stage2.props) as propKey}
						<Field prop={current.stage2.props[propKey]} name={propKey} />
					{/each}
				{/if}
			</Dropdown>
		</Panel>
		<Separator />
		<Panel title="Output" width="33%" direction="column">
			<Dropdown title="Monitor">
				<Output renderer={renderer} />
			</Dropdown>
			<Dropdown title="Settings">
				<Dropdown title="Transition">
					<Field prop={{ value: renderer.treshold.value, min: 0, max: 1, step: 0.01, onChange: ({ value }) => renderer.treshold.value = value }} name="treshold" />
				</Dropdown>
				<Dropdown title="Post-processing">
				</Dropdown>
			</Dropdown>
		</Panel>
	</Panel>
	<Separator height="1px" width="100%" />
	<Panel width="100%" height="calc(28vh - 1px)" direction="row">
		<Panel width="50%" title="Input Settings" direction="column">
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
		</Panel>
		<Separator />
		<Panel width="50%" title="Output settings" direction="column">
			<Dropdown title="Dimensions">
				<Field prop={{ value: 1920, type: "number", step: 1 }} name="width" triggerable={false} />
				<Field prop={{ value: 1080, type: "number", step: 1 }} name="height" triggerable={false} />
			</Dropdown>
		</Panel>
	</Panel>
	<slot name="end"></slot>
</main>

<script>
import { onMount } from "svelte";
import OGLRenderer from "./renderers/OGLRenderer.js";
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
import Output from "./ui/Output.svelte";
import Separator from "./ui/Separator.svelte";
import Window from "./ui/Window.svelte";
import Trigger from "./ui/Trigger.svelte";


export let renderer = {};

export let stages = {};

let { dimensions, gl } = renderer;
$: list = Object.keys(stages).map(key => ({ key: stages[key].name, value: stages[key].name }));

$: current = {
	stage1: null,
	stage2: null,
};

$: treshold = renderer.treshold.value;

let instanced = {};

function handleStageChange(id, key) {
	setStage(id, key);
}

function setStage(id, key) {
	if (!instanced[key]) {
		const { scene, name, props } = stages[key];

		stages[key].instance = new scene({
			name,
			...renderer,
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

<style>
main {
	position: relative;

	display: flex;
	flex-direction: column;
	height: 100%;
	margin: 0 auto;

	overflow: hidden;
}

.stage__live {
	width: 10px;
	height: 10px;
	
	background-color: red;
	border-radius: 50%;
}

.stage__header {
	padding-right: 20px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

</style>