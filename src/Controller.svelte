<Panel width="100%" height="72vh" direction="row">
    <PanelStage
        title="Stage 1"
        list={list}
        width="33%"
        stage={current.stage1}
        renderer={renderer}
        onChangeStage={({ key }) => handleStageChange('stage1', key)}
        output={output}
    />
    <Separator />
    <PanelStage
        title="Stage 2"
        list={list}
        width="33%"
        stage={current.stage2}
        renderer={renderer}
        onChangeStage={({ key }) => handleStageChange('stage2', key)}
        output={output}
    />
    <Separator />
    <PanelOutput
        width="33%"
        renderer={renderer}
        current={current}
    />
</Panel>
<Separator height="1px" width="100%" />
<Panel width="100%" height="calc(28vh - 1px)" direction="row">
    <PanelInputSettings
        width="50%"
    />
    <Separator />
    <PanelOutputSettings
        width="50%"
        renderer={renderer}
    />
</Panel>

<script>
import { onMount, setContext } from "svelte";
import { writable } from "svelte/store";
import cloneDeep from "clone-deep";
import Panel from "./ui/Panel.svelte";
import PanelStage from "./ui/PanelStage.svelte";
import PanelOutput from "./ui/PanelOutput.svelte";
import PanelInputSettings from "./ui/PanelInputSettings.svelte";
import PanelOutputSettings from "./ui/PanelOutputSettings.svelte";
import Separator from "./ui/Separator.svelte";

// props
export let renderer = {};
export let stages = {};
export let output;


let instanced = {};
let stageList = Object.keys(stages).reduce((all, key) => {
    all[key] = stages[key];

    let cloneKey = `${key}-clone`; 

    all[cloneKey] = cloneDeep(stages[key], true);
    all[cloneKey].name = `${stages[key].name} (Clone)`;

    return all;
}, {});

let dimensions = writable(renderer.dimensions);
setContext('rendererDimensions', dimensions);

dimensions.subscribe((value) => {
    Object.keys(instanced).forEach( key => {
        instanced[key].instance.resize({ width: value.width, height: value.height });
    })
})

$: list = Object.keys(stageList).map(key => ({
    key: key,
    label: stageList[key].name,
}));
$: current = {
	stage1: null,
	stage2: null,
};

function handleStageChange(id, key) {
	setStage(id, key);
}

function setStage(id, key) {
	if (!instanced[key]) {
        
		const { scene, name, props } = stageList[key];

		stageList[key].instance = scene({
			name,
			renderer,
			props,
		});

		instanced[key] = stageList[key];
	}

    current[id] = instanced[key];
}

onMount(() => {
    let list = stages;

    if (Object.keys(stages).length < 2) {
        list = stageList;
    }

	Object.keys(list).forEach((name, index) => {
		if (index < 2) {
			setStage(`stage${index+1}`, name);
		}
	});
});
</script>