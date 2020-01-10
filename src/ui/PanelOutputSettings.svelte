<Panel width={width} title="Output settings" direction="column">
    <Dropdown title="Dimensions">
        <Field prop={{ value: 1920, type: "number", step: 1 }} name="width" triggerable={false} />
        <Field prop={{ value: 1080, type: "number", step: 1 }} name="height" triggerable={false} />
    </Dropdown>
</Panel>

<script>
import Panel from "./Panel.svelte";
import Field from "./Field.svelte";
import Dropdown from "./Dropdown.svelte";

// props
export let width;
</script>