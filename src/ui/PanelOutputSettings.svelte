<Panel width={width} title="Output settings" direction="column">
    <Dropdown title="Dimensions">
        <Field prop={propWidth} name="width" triggerable={false} onSubmit={handleSubmitWidth}/>
        <Field prop={propHeight} name="height" triggerable={false} onSubmit={handleSubmitHeight} />
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

$: propWidth = { value: dimensions.width, type: "number", step: 1 };
$: propHeight = { value: dimensions.height, type: "number", step: 1 };

OutputWindow.onResize(() => {
    dimensions.width = OutputWindow.dimensions.width;
    dimensions.height = OutputWindow.dimensions.height;
});

function handleSubmitWidth(value) {
    OutputWindow.setSize(value, OutputWindow.dimensions.height);
}

function handleSubmitHeight(value) {
    OutputWindow.setSize(OutputWindow.dimensions.width, value);
}

</script>