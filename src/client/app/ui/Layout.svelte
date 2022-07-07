<script>
import Row from "./Row.svelte";
import RowToolBar from "./RowToolBar.svelte";
import Column from "./Column.svelte";
import ModuleRenderer from "./ModuleRenderer.svelte";
import Resizer from "./Resizer.svelte";
import { singleLayout } from "../stores/layout.js"; 
import { defaultLayouts } from "../data/LayoutData";
import { onKeyDown } from "../triggers/Keyboard";

import { current as currentLayout } from "../stores/layout.js";
import { onDestroy, onMount } from "svelte";

let trigger;

onMount(() => {
    let prev;

    trigger = onKeyDown('o', () => {
        currentLayout.update((curr) => {
            let layout = prev ? prev : singleLayout;

            prev = {...curr};

            return layout;
        });
    });
});

onDestroy(() => {
    trigger.destroy();
    trigger = null;
})

</script>

<div class="layout">
    <div class="content">
        {#each $currentLayout.rows as row, rowIndex}
            <Row current={row} index={rowIndex}>
                {#if row.cols && row.cols.length >0 }
                    {#each row.cols as col, colIndex}
                        <Column current={col} index={colIndex}>
                            {#if col.modules && col.modules.length > 0}
                                {#each col.modules as module, moduleIndex (module.name)}
                                    <div style={`height: ${100/col.modules.length}%; flex-shrink: 0; flex-grow: 0;`}>
                                        <ModuleRenderer module={module} index={moduleIndex} />
                                    </div>
                                    {#if rowIndex !== $currentLayout.rows.length - 1}
                                        <Resizer
                                            direction="horizontal"
                                            rowIndex={rowIndex}
                                        />
                                    {/if}
                                {/each}
                            {/if}
                        </Column>
                        {#if colIndex !== row.cols.length - 1}
                            <Resizer
                                direction="vertical"
                                rowIndex={rowIndex}
                                colIndex={colIndex}
                            />
                        {/if}
                    {/each}
                {/if}
            </Row>
            {#if rowIndex !== $currentLayout.rows.length - 1}
                <Resizer
                    direction="horizontal"
                    rowIndex={rowIndex}
                />
            {/if}
        {/each}
        {#if $currentLayout.editable }
            <RowToolBar />
        {/if }
    </div>
</div>

<style>
.layout {
    position: relative;
    display: flex;
    width: 100%;
    /* height: calc(100% - var(--height-topbar)); */
    height: 100%;
    flex-direction: column;
}

.content {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
}

</style>
