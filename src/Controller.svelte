<Panel width="100%" height="72vh" direction="row">
    <PanelStage
        title="Stage 1"
        stages={allStages}
        index={0}
        width="33%"
        renderer={renderer}
        output={output}
    />
    <Separator />
    <PanelStage
        title="Stage 2"
        stages={allStages}
        index={1}
        width="33%"
        renderer={renderer}
        output={output}
    />
    <Separator />
    <PanelOutput
        width="33%"
        renderer={renderer}
    />
</Panel>
<Separator height="1px" width="100%" />
<Panel width="100%" height="calc(28vh - 1px)" direction="row">
    <Panel width="50%" title="Input Settings" direction="column">
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
import FieldsAudio from "./ui/fields/FieldsAudio.svelte";
import FieldsMidi from "./ui/fields/FieldsMidi.svelte";
import FieldsWebcam from "./ui/fields/FieldsWebcam.svelte";
import PanelOutputSettings from "./ui/PanelOutputSettings.svelte";
import Separator from "./ui/Separator.svelte";
import Dropdown from "./ui/Dropdown.svelte";
import { Storage } from "./core/Storage.js";

// props
export let renderer = {};
export let stages = {};
export let output;


let instanced = {};
let allStages = Object.keys(stages).reduce((all, key) => {
    all[key] = stages[key];

    let cloneKey = `${stages[key].name} (Clone)`; 

    all[cloneKey] = cloneDeep(stages[key], true);
    all[cloneKey].name = cloneKey;

    return all;
}, {});


let dimensions = writable(renderer.dimensions);
setContext('rendererDimensions', dimensions);

dimensions.subscribe((value) => {
    Object.keys(allStages).forEach( (key) => {
        let stage = allStages[key];

        if (stage.instance) {
            stage.instance.resize({ width: value.width, height: value.height });
        }
    });
});

let current = writable({ stage1: null, stage2: null });
setContext('currentStages', current);

current.subscribe((value) => {
    let names = Object.keys(value).map( key => {
        if (value[key]) return value[key].name;
        
        return null;
    });

    Storage.set('current', JSON.stringify(names));
})

</script>