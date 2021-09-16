<script>
import { current as currentRendering } from "../stores/rendering.js";
import Module from "../ui/Module.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Field from "../ui/Field.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

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

<Module name="Parameters">
    <div slot="header-right">
        <ModuleHeaderAction
            value={"monitor"}
            permanent
            border
            options={[
                { value: "monitor", label: "monitor" },
                { value: "output", label: "output" },
            ]}
        />
    </div>
    <Field
        name="Resolution"
        value={[1920, 1080]}
        on:change={handleChangeDimensions}
        params={{
            step: 1,
            suffix: "px",
            locked: true,
            triggers: false,
        }}
    />
    <FieldGroup name="Layout">
        <Field
            name="Resolution"
            value={[1920, 1080]}
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
                { label: "z", value: 10 },
            ]}
            on:change={handleChangeDimensions}
            params={{
                step: 1,
                suffix: "px",
                locked: false
            }}
        />
        <Field
            name="color"
            value={"rgba(255, 255, 255, 0.5)"}
        />
    </FieldGroup>
    <Field
        name="text"
        value={"hello"}
    />
    <Field
        name="text"
        value={() => console.log("clicked")}
        params={{
            label: "randomize"
        }}
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
