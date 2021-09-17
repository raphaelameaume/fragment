<script>
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentSketches } from "../stores/sketches.js";
import Module from "../ui/Module.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Field from "../ui/Field.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

let dimensions = [currentWidth, currentHeight];

let pristine = false;
let sketch;

$: currentWidth = $currentRendering.width;
$: currentHeight = $currentRendering.height;
$: options = [
    ...$currentRendering.monitors.map((monitor, index) => {
        return { value: index, label: `monitor ${index} `}
    }),
    { value: "output", label: "output" },
];

$: monitorIndex = options[0].value;

$: {
    let monitor = $currentRendering.monitors[monitorIndex];

    if (monitor) {
        let { value: key } = monitor;
        
        sketch = $currentSketches[key]
    }
}

function handleChangeSelect(event) {
    monitorIndex = event.currentTarget.value;
}

</script>

<Module name="Parameters">
    <div slot="header-right">
        <ModuleHeaderAction
            value={monitorIndex}
            permanent
            border
            on:change={handleChangeSelect}
            options={options}
        />
    </div>
    {#if sketch }
        {#if typeof sketch.props === "object"}
            {#each Object.keys(sketch.props) as key, i}
                <Field
                    name={key}
                    value={sketch.props[key].value}
                    params={(() => {
                        const { value, ...params } = sketch.props[key];

                        return params;
                    })()}
                />
            {/each}
        {/if}
    {/if}
    <FieldGroup name="Layout">
        <Field
            name="vector"
            value={[
                { label: "x", value: 10 },
                { label: "y", value: 10 },
                { label: "z", value: 10 },
            ]}
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
