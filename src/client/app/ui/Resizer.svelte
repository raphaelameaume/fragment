<script>
import { map, clamp } from "lemonade-math";
import { current as currentLayout } from "../data/LayoutData.js";

const DIRECTIONS = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
};


export let rowIndex;
export let colIndex = -1;
export let direction = DIRECTIONS.HORIZONTAL;

let isDragging = false;

$: currentRow = $currentLayout.rows[rowIndex];
$: nextRow = $currentLayout.rows[rowIndex + 1];

$: currentCol = colIndex >= 0 ? currentRow.cols[colIndex] : null;
$: nextCol = currentCol ? currentRow.cols[colIndex + 1] : null;

let currentRowRect, nextRowRect;
let currentColRect, nextColRect;
let totalRowGrow = 0;
let totalColGrow = 0;

const MIN_WIDTH_COL = 100;
const MIN_HEIGHT_ROW = 80;

function handleMouseDown() {
    if (!isDragging) {
        isDragging = true;

        currentRowRect = currentRow.$element.getBoundingClientRect();
        nextRowRect = nextRow.$element.getBoundingClientRect();

        totalRowGrow = currentRow.grow + nextRow.grow;

        if (direction === DIRECTIONS.VERTICAL && currentCol && nextCol) {
            totalColGrow = currentCol.grow + nextCol.grow;

            currentColRect = currentCol.$element.getBoundingClientRect();
            nextColRect = nextCol.$element.getBoundingClientRect();
        }
    }
}

function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        if (direction === DIRECTIONS.HORIZONTAL) {
            const top = currentRowRect.top;
            const bottom = nextRowRect.bottom;

            const y = clamp(event.clientY, top + MIN_HEIGHT_ROW, bottom - MIN_HEIGHT_ROW); 

            const prevGrow = map(y, top, bottom, 0, totalRowGrow);
            const nextGrow = map(y, bottom, top, 0, totalRowGrow);
            
            currentLayout.update((current) => {
                const updated = {
                    ...current,
                    rows:  current.rows.map((row, index) => {
                        return index === rowIndex ? {...row, grow: prevGrow } :
                            index === (rowIndex + 1 ) ? {...row, grow: nextGrow} : row
                    })
                };

                return updated; 
            });
        } else if (direction === DIRECTIONS.VERTICAL && currentCol && nextCol) {
            const left = currentColRect.left;
            const right = nextColRect.right;

            const x = clamp(event.clientX, left + MIN_WIDTH_COL, right - MIN_WIDTH_COL);
            const prevGrow = map(x, left, right, 0, totalColGrow);
            const nextGrow = map(x, right, left, 0, totalColGrow);

            currentLayout.update((current) => {
                const updated = {
                    ...current,
                    rows: current.rows.map((row, i) => {
                        return i !== rowIndex ? row :
                            {
                                ...row,
                                cols: row.cols.map((col, j) => {
                                    return j === colIndex ? {...col, grow: prevGrow } :
                                        j === (colIndex + 1) ? {...col, grow: nextGrow } : col;
                                })
                            }
                    })
                };

                return updated;
            })
        }
    }
}

</script>

<div class="resizer resizer--{direction}">
    <div class="resizer-hover" on:mousedown={handleMouseDown}></div>
</div>

<svelte:body on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

<style>
.resizer {
    position: relative;
}

.resizer-hover {
    position: absolute;
    z-index: 999;

    background: rgba(255, 0, 0, 0.5);
}

.resizer--horizontal {
    height: 0;
}

.resizer--horizontal .resizer-hover {
    top: -4px;
    right: 0;
    bottom: -4px;
    left: 0;

    cursor: ns-resize;
}

.resizer--vertical {
    width: 0;
}

.resizer--vertical .resizer-hover {
    top: 0;
    right: -4px;
    bottom: 0;
    left: -4px;

    cursor: ew-resize;

    background: rgba(0, 255, 0, 0.5);
}

</style>
