<Panel width="100%" height="72vh" direction="row">
    <PanelStage
        title="Stage 1"
        index={0}
        list={list}
        width="33%"
        stage={current.stage1}
        renderer={renderer}
        onChangeStage={({ key }) => handleStageChange('stage1', key)}
    />
    <Separator />
    <PanelStage
        title="Stage 2"
        index={1}
        list={list}
        width="33%"
        stage={current.stage2}
        renderer={renderer}
        onChangeStage={({ key }) => handleStageChange('stage2', key)}
    />
    <Separator />
    <PanelOutput
        width="33%"
        renderer={renderer}
    />
</Panel>
<Separator height="1px" width="100%" />
<Panel width="100%" height="calc(28vh - 1px)" direction="row">
    <PanelInputSettings
        width="50%",
        midi={midi},
    />
    <Separator />
    <PanelOutputSettings
        width="50%"
    />
</Panel>

<script>
import { onMount } from "svelte";
import Panel from "./ui/Panel.svelte";
import PanelStage from "./ui/PanelStage.svelte";
import PanelOutput from "./ui/PanelOutput.svelte";
import PanelInputSettings from "./ui/PanelInputSettings.svelte";
import PanelOutputSettings from "./ui/PanelOutputSettings.svelte";
import Separator from "./ui/Separator.svelte";

// props
export let renderer = {};
export let stages = {};
export let midi = {};

let instanced = {};

$: list = Object.keys(stages).map(key => ({ key: stages[key].name, value: stages[key].name }));
$: current = {
	stage1: null,
	stage2: null,
};

function handleStageChange(id, key) {
	console.log(id, key);
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
</script>