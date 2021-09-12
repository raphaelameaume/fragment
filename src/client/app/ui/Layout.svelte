<script>
import { map, clamp } from "lemonade-math";

import Row from "./Row.svelte";
import Column from "./Column.svelte";
import Module from "./Module.svelte";
import Resizer from "./Resizer.svelte";

let current = {
    rows: [
        {
            grow: 1,
            $element: null,
            cols: [
                {
                    grow: 1.5,
                },
                {
                    grow: 0.5,
                }
            ],
        }, {
            grow: 1,
            cols: [
                { grow: 1 }
            ]
        }, {
            grow: 1,
            cols: [
                {
                    grow: 1,
                },
                {
                    grow: 1,
                },
                {
                    grow: 1,
                },
                {
                    grow: 1,
                }
            ]
        }
    ]
};

function addRow() {
    current.rows = [...current.rows, { grow: 1, cols: []}];
}

function handleRowDelete(index) {
    current.rows = current.rows.filter((row, rowIndex) => index !== rowIndex);
}

function handleColumnAdd(rowIndex) {
    current.rows = current.rows.map((row, index) => {
        return index === rowIndex ? {...row, cols: [...row.cols, { grow: 1, modules: [] }]} : row;
    });
}

let isResizing = false;
let prevRow, nextRow;
let prevRect, nextRect;

let coords = {
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
};

let totalGrow = 0;

function handleResizerDragStart({ prevIndex, nextIndex, event }) {
    prevRow = current.rows[prevIndex];
    nextRow = current.rows[nextIndex];

    let $prevRow = prevRow.$element;
    let $nextRow = nextRow.$element;
    
    prevRect = $prevRow.getBoundingClientRect();
    nextRect = $nextRow.getBoundingClientRect();

    coords.start.y = event.clientY;

    totalGrow = prevRow.grow + nextRow.grow;
}

function handleResizerDragEnd({ prevIndex, nextIndex, event }) {

}

function handleResizerDrag({ prevIndex, nextIndex, event }) {
    coords.current.y = event.clientY;

    const top = prevRect.top;
    const bottom = nextRect.bottom;
    
    const y = clamp(event.clientY, top + 80, bottom - 80); 

    const prevGrow = map(y, top, bottom, 0, totalGrow);
    const nextGrow = map(y, bottom, top, 0, totalGrow);

    current.rows = current.rows.map((row, index) => {
        return index === prevIndex ? {...row, grow: prevGrow } :
            index === nextIndex ? {...row, grow: nextGrow} : row
    });
}

</script>

<div class="layout">
    <nav class="nav">
        <button on:click={addRow}>Add row</button>
    </nav>
    <div class="content">
        {#each current.rows as row, rowIndex}
            <Row grow={row.grow} index={rowIndex} bind:node={row.$element} onColumnAdd={handleColumnAdd} onDelete={handleRowDelete}>
                {#each row.cols as col, colIndex}
                    <Column grow={col.grow}>
                        {#if col.modules && col.modules.length > 0}
                            {#each col.modules as module}
                                <Module name={module}></Module>
                            {/each}
                        {/if}
                    </Column>
                {/each}
            </Row>
            {#if rowIndex !== current.rows.length - 1}
                <Resizer
                    prevIndex={rowIndex}
                    nextIndex={rowIndex + 1}
                    onDragStart={handleResizerDragStart}
                    onDrag={handleResizerDrag}
                    onDragEnd={handleResizerDragEnd}
                />
            {/if}
        {/each}
    </div>
</div>

<style>
.layout {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    padding: 0 3px;
}

.content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.nav {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 1px;
    flex-grow: 0;
    height: 24px;
}

</style>
