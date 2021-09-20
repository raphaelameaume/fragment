<script>
import { current as currentRendering } from "../stores/rendering.js";
import { current as currentSketches } from "../stores/sketches.js";
import Module from "../ui/Module.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";
import Field from "../ui/Field.svelte";
import ModuleHeaderAction from "../ui/ModuleHeaderAction.svelte";

let pristine = false;
let sketch;

let monitorIndex, options;

$: {
    options = [
        ...$currentRendering.monitors.map((monitor, index) => {
            return { value: index, label: `monitor ${index} `}
        }),
        { value: "output", label: "output" },
    ];

    if (!pristine) {
        monitorIndex = options[0].value;
    }

    const monitor = $currentRendering.monitors[monitorIndex];

    if (monitor) {
        let { value: key } = monitor;
        
        sketch = $currentSketches[key]
    }
}

function handleChangeSelect(event) {
    monitorIndex = event.currentTarget.value;
    pristine = true;
}

function handleChangeDimensions(event) {
    const [width, height] = event.detail;

    $currentRendering.width = width;
    $currentRendering.height = height;
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
            name="dimensions"
            value={[
                $currentRendering.width,
                $currentRendering.height,
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
