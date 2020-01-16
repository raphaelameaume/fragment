<Panel width={width} title="Output settings" direction="column">
    <Dropdown title="Dimensions">
        <Field prop={propWidth} name="width" triggerable={false} />
        <Field prop={propHeight} name="height" triggerable={false} />
    </Dropdown>
</Panel>

<script>
import { onMount, afterUpdate } from "svelte";
import Panel from "./Panel.svelte";
import Field from "./Field.svelte";
import Dropdown from "./Dropdown.svelte";
import { OutputWindow } from "../core/OutputWindow.js";

// props
export let width;

let dimensions = { ...OutputWindow.dimensions };

$: propWidth = {
    value: OutputWindow.dimensions.width,
    type: "number",
    step: 1,
    onChange: (value) => {
        // /!\ Cause an infinite loop
        // OutputWindow.setSize(value, OutputWindow.dimensions.height);
    }
};
$: propHeight = {
    value: dimensions.height,
    type: "number",
    step: 1,
    onChange: (value) => {
        // /!\ Cause an infinite loop
        // OutputWindow.setSize(OutputWindow.dimensions.width, value);
    }
};

OutputWindow.onResize(() => {
    dimensions.width = OutputWindow.dimensions.width;
    dimensions.height = OutputWindow.dimensions.height;
});

</script>