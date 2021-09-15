<script>
import { current as currentRendering } from "../stores/rendering.js";
import Module from "../ui/Module.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Field from "../ui/Field.svelte";



let dimensions = [currentWidth, currentHeight];

$: currentWidth = $currentRendering.width;
$: currentHeight = $currentRendering.height;

function handleChangeDimensions(event) {
    console.log("handle change dimensions", event.detail);
    // $currentRendering.width = width;
    // $currentRendering.height = height;
    // dimensions[0] = width;
    // dimensions[1] = height;

    // currentWidth = width;
    // currentHeight = height;
}

$: test = 1200;

</script>

<Module name="Output Parameters">
    <Field
        name="dimensions"
        value={[10, 20]}
        on:change={handleChangeDimensions}
        params={{
            step: 1,
            suffix: "px",
            locked: true
        }}
    />
    <Field
        name="vector"
        value={[
            { label: "x", value: 10 },
            { label: "y", value: 10 },
        ]}
        on:change={handleChangeDimensions}
        params={{
            step: 1,
            suffix: "px",
            locked: true
        }}
    />
    <Field
        name="color"
        value={"rgba(255, 255, 255, 0.5)"}
    />
    <Field
        name="text"
        value={"hello"}
    />
    <Field
        name="isChecked"
        value={true}
    />
    <Field
        name="z"
        value={10}
        params={{
            min: 0,
            max: 100,
        }}
    />
</Module>
