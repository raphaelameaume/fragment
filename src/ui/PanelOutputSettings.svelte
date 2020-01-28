<Panel width={width} title="Output settings" direction="column">
    <Dropdown title="Dimensions" url="OutputSettings/Dimensions/Dropdown">
        <Field prop={propWidth} name="width" triggerable={false} url="output/props/width" />
        <Field prop={propHeight} name="height" triggerable={false} url="output/props/height" />
    </Dropdown>
</Panel>

<script>
import Panel from "./Panel.svelte";
import Field from "./Field.svelte";
import Dropdown from "./Dropdown.svelte";
import { OutputWindow } from "../core/OutputWindow.js";
import { rendererDimensions } from "../store.js";

// props
export let width;
export let renderer;

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
</script>