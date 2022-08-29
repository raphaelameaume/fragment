<script>
import ModuleHeaderAction from "./ModuleHeaderAction.svelte";
import { all as allSketches, current as currentSketches } from "../stores/sketches.js";
import { monitors } from "../stores/rendering";

export let monitorID;
export let selected;

$: options = [
    ...Object.keys($allSketches).map((key) => ({
        value: key,
        label: $allSketches[key].name ? $allSketches[key].name : key,
    })),
];

$: {
    if ($currentSketches.length > 1 && !options.some((opt) => opt.value === "output")) {
        options = [
            ...options,
            { value: "output", label: "output" },
        ];
    }
    
    if (selected === undefined) {
        selected = options[0].value;
    }

}

$: {
    monitors.update((all) => {
        return all.map((monitor) => {
            if (monitor.id === monitorID) {
                monitor.selected = selected;
            }

            return monitor;
        });
    });
}

</script>

<ModuleHeaderAction
    value={selected}
    permanent
    border
    on:change={(event) => selected = event.detail}
    options={options}
/>
