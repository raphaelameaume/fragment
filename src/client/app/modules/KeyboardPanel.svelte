<script>
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";

</script>

<Module name="Keyboard" {...$$props}>
    <Field
        name="Coordinates"
        value={[1920, 1080]}
        params={{
            step: 1,
            suffix: "px",
            locked: true
        }}
    />
    <Field
        name="Normalized"
        value={[1920, 1080]}
        params={{
            step: 1,
            suffix: "px",
            locked: true
        }}
    />
</Module>
