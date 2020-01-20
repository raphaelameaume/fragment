<div class="output" bind:this={element}>

    <div style="display: none">
        {#if stage1 !== null}
            {#each Object.keys(stage1.props) as propKey}
                <Field prop={stage1.props[propKey]} name={propKey} url={`${stage1.name}/props/${propKey}`} output={true} />
            {/each}
        {/if}
        {#if stage2 !== null}
            {#each Object.keys(stage2.props) as propKey}
                <Field prop={stage2.props[propKey]} name={propKey} url={`${stage2.name}/props/${propKey}`} output={true} />
            {/each}
        {/if}
        {#each Object.keys(renderer.props) as propKey}
            <Field prop={renderer.props[propKey]} name={propKey} url={`Output/props/${propKey}`} output={true} />
        {/each}
    </div>
</div>

<script>
import { onMount } from "svelte";
import { on } from "./events.js";
import { Storage } from "./core/Storage.js"; 
import Field from "./ui/Field.svelte";

// props
export let renderer;
export let stages;

// variables
let element;

let current = Storage.get('current');

let stage1;
let stage2;

Storage.rehydrate('current', (current) => {
    stage1 = current && current.length > 0 ? stages[current[0]] : null;
    instanciate(stage1);

    stage2 = current && current.length > 1 ? stages[current[1]] : null;
    instanciate(stage2);
});

function instanciate(stage) {
    if (stage) {
        let { name, props, scene } = stage;

        stage.instance = scene({
            name,
            props,
            renderer,
        });
    }
}

onMount(() => {
    renderer.canvas.style.width = '100%';
    renderer.canvas.style.height = 'auto';
    element.appendChild(renderer.canvas);

    on('frame', update);
});

function update({ deltaTime, time }) {
    if (stage1 && stage2) {
        renderer.render(stage1, stage2, { deltaTime, time });
    }
}

</script>

<style>
.output {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    background-color: black;
}
</style>