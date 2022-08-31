<script>
import ModuleHeaderAction from "./ModuleHeaderAction.svelte";
import { sketches, sketchesKeys, sketchesCount } from "../stores/sketches.js";
import { monitors } from "../stores/rendering";

export let monitorID;
export let selected;

$: options = [
    ...$sketchesKeys.map((key) => ({
        value: key,
        label: $sketches[key] && $sketches[key].name ? $sketches[key].name : key,
    })),
];

$: {
    if ($sketchesCount > 1 && !options.some((opt) => opt.value === "output")) {
        options = [
            ...options,
            { value: "output", label: "output" },
        ];
    }

    if (options.length > 0 && selected === undefined) {
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
