<script>
import Row from "./Row.svelte";
import RowToolBar from "./RowToolBar.svelte";
import Column from "./Column.svelte";
import ModuleRenderer from "./ModuleRenderer.svelte";
import Menu from "./Menu.svelte";
import Resizer from "./Resizer.svelte";

import { current as currentLayout } from "../stores/layout.js";

</script>

<Menu />
<div class="layout">
    <div class="content">
        {#each $currentLayout.rows as row, rowIndex}
            <Row current={row} index={rowIndex}>
                {#if row.cols && row.cols.length >0 }
                    {#each row.cols as col, colIndex}
                        <Column current={col} index={colIndex}>
                            {#if col.modules && col.modules.length > 0}
                                {#each col.modules as module, moduleIndex}
                                    <ModuleRenderer module={module} index={moduleIndex} />
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
    height: calc(100% - var(--topBarHeight));
    flex-direction: column;
}

.content {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
}

</style>
