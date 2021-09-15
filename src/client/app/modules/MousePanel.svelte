<script>
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import ButtonInput from "../ui/fields/ButtonInput.svelte";

$: screen = [0, 0];
$: normalized = [screen[0] / window.innerWidth, screen[1] / window.innerHeight];
$: ortho = [normalized[0] * 2 - 1, normalized[1] * 2 - 1];

function handleMouseMove(event) {
    screen = [event.clientX, event.clientY];
}

function handleClickClear(event) {

}

</script>

<svelte:window on:mousemove={handleMouseMove} />

<Module name="Mouse" {...$$props}>
    <Field
        name="screen"
        value={screen}
        params={{
            step: 1,
            disabled: true
        }}
    />
    <Field
        name="normalized"
        value={normalized}
        params={{
            step: 0.0001,
            locked: true,
            disabled: true
        }}
    />
    <Field
        name="orthographic"
        value={ortho}
        params={{
            step: 0.0001,
            locked: true,
            disabled: true
        }}
    />
    <Field
        name="events"
        value={[
            "19:58:32 – mouseup",
            "19:58:32 – mousedown",
            "19:58:32 – click",
            "19:58:32 – click",
            "19:58:32 – click",
        ]}
        type="list"
        params={{
            disabled: false
        }}
    >
        <ButtonInput slot="input" label={"Clear"} on:click={handleClickClear} />
    </Field>
</Module>
