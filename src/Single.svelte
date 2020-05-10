<Panel width="100%">
    <Panel width="30%" direction="column">
        <Field prop={propStage} name="stage" triggerable={false} url={`Single/stage`} />
        <Dropdown title="Scene">
            {#if stage !== null}
                {#each Object.keys(stage.props) as propKey}
                    <Field prop={stage.props[propKey]} name={propKey} url={`${stage.name}/props/${propKey}`} output={false} />
                {/each}
            {/if}
        </Dropdown>
        <Dropdown title="Renderer">
            {#each Object.keys(renderer.props) as propKey}
                <Field prop={renderer.props[propKey]} name={propKey} url={`Output/props/${propKey}`} />
            {/each}
        </Dropdown>
        <Dropdown title="Inputs">
            <Dropdown title="Audio" opened={true}>
                <FieldsAudio />
            </Dropdown>
            <Dropdown title="Midi" opened={false}>
                <FieldsMidi />
            </Dropdown>
            <Dropdown title="Video" opened={false}>
                <FieldsWebcam />
            </Dropdown>
        </Dropdown>
        <Dropdown title="Output" url="SingleOutputSettings/Dimensions/Dropdown">
            <Field prop={propWidth} name="width" triggerable={false} url="SingleOutputSettings/props/width" />
            <Field prop={propHeight} name="height" triggerable={false} url="SingleOutputSettings/props/height" />
        </Dropdown>
    </Panel>
    <Panel width="70%">
        <div class="output" bind:this={output}></div>
    </Panel>
    <Separator />
</Panel>

<script>
import { onMount } from "svelte";
import Panel from "./ui/Panel.svelte";
import Separator from "./ui/Separator.svelte";
import Dropdown from "./ui/Dropdown.svelte";
import Select from "./ui/Select.svelte";
import Field from "./ui/Field.svelte";
import FieldsMidi from "./ui/fields/FieldsMidi.svelte";
import FieldsWebcam from "./ui/fields/FieldsWebcam.svelte";
import FieldsAudio from "./ui/fields/FieldsAudio.svelte";
import PanelOutputSettings from "./ui/PanelOutputSettings.svelte";
import { rendererDimensions } from "./store.js";
import { on } from "./events.js";

export let stages;
export let renderer;

let output;

let stageNames = Object.keys(stages);
let list = stageNames.map(key => ({
	key: stages[key].name,
    label: stages[key].name,
}));

let stage = stages[stageNames[0]];

let propStage = {
    name: "stage",
    type: "select",
    value: stage.name,
    options: list,
    onChange: (value) => {
        stage = stages[propStage.value];
    }
};

let propWidth = {
    value: renderer.dimensions.width,
    step: 1,
    onChange: ({ value }) => {
        renderer.resize(value, renderer.dimensions.height);
        $rendererDimensions.width = value;
    }
};
let propHeight = {
    value: renderer.dimensions.height,
    step: 1,
    onChange: ({ value }) => {
        renderer.resize(renderer.dimensions.width, value);
        $rendererDimensions.height = value;
    }
};

$: {
	if (!stage.instance) {
		let { name, props, scene } = stage;
		stage.instance = new scene({
			name,
			props,
			renderer,
		});
    }
    
    if (typeof stage.instance.onMount === 'function') {
        stage.instance.onMount({ container: output, canvas: renderer.canvas });
    }
}

onMount(() => {
    renderer.canvas.style.width = '100%';
    renderer.canvas.style.height = 'auto';
    output.appendChild(renderer.canvas);

    on('frame', update);
});

function update({ deltaTime, time }) {
    renderer.render(stage, null, { deltaTime, time });
}

</script>

<style>
.output {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    background-color: black;
}
</style>