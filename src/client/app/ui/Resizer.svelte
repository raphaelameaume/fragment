<script>
import { getContext } from "svelte";
import { map, clamp } from "lemonade-math";
import { current as currentLayout } from "../stores/layout.js";

const DIRECTIONS = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
};

export let direction = DIRECTIONS.HORIZONTAL;

export let rowIndex = -1;
export let colIndex = -1;

console.log({ rowIndex, colIndex });
let isDragging = false;

$: currentRow = $currentLayout.rows[rowIndex];
$: nextRow = $currentLayout.rows[rowIndex + 1];

$: currentCol = colIndex >= 0 ? currentRow.cols[colIndex] : null;
$: nextCol = currentCol ? currentRow.cols[colIndex + 1] : null;

let currentRowRect, nextRowRect;
let currentColRect, nextColRect;
let totalRowGrow = 0;
let totalColGrow = 0;

let visible = false;

const MIN_WIDTH_COL = 100;
const MIN_HEIGHT_ROW = 80;

function handleMouseDown() {
    if (!isDragging) {
        isDragging = true;

        $currentLayout.resizable = true;

        document.body.style.userSelect = "none";
        document.body.style.cursor = direction === DIRECTIONS.HORIZONTAL ? "ns-resize" : "ew-resize";

        currentRowRect = currentRow && currentRow.$element.getBoundingClientRect();
        nextRowRect = nextRow && nextRow.$element.getBoundingClientRect();

        totalRowGrow = (currentRow ? currentRow.grow : 0) + (nextRow ? nextRow.grow : 0);

        if (direction === DIRECTIONS.VERTICAL) {
            if (currentCol && nextCol) {
                totalColGrow = currentCol.grow + nextCol.grow;

                currentColRect = currentCol.$element.getBoundingClientRect();
                nextColRect = nextCol.$element.getBoundingClientRect();

                currentCol.resizing = true;
                nextCol.resizing = true;

                visible = currentCol.grow === nextCol.grow;
            }
        } else {
            if (currentRow) {
                currentRow.resizing = true;
            }

            if (nextRow) {
                nextRow.resizing = true;
            }

            visible = currentRow.grow === nextRow.grow;
        }

    }
}

function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        visible = false;
        document.body.style.userSelect = null;
        document.body.style.cursor = null;

        $currentLayout.resizable = false;

        currentRow.resizing = false;

        if (nextRow) {
            nextRow.resizing = false;
        }

        if (direction === DIRECTIONS.VERTICAL) {
            currentCol.resizing = false;
            nextCol.resizing = false;
        }
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        if (direction === DIRECTIONS.HORIZONTAL) {
            const top = currentRowRect.top;
            const bottom = nextRowRect.bottom;

            const y = clamp(event.clientY, top + MIN_HEIGHT_ROW, bottom - MIN_HEIGHT_ROW); 

            let prevGrow = Math.round(map(y, top, bottom, 0, totalRowGrow) * 100) / 100;
            let nextGrow = Math.round(map(y, bottom, top, 0, totalRowGrow) * 100) / 100;

            if (Math.abs(nextGrow - prevGrow) < 0.05) {
                prevGrow = totalRowGrow * 0.5;
                nextGrow = totalRowGrow * 0.5;
            }

            visible = prevGrow === nextGrow;
            
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
            let prevGrow = Math.round(map(x, left, right, 0, totalColGrow) * 100) / 100;
            let nextGrow = Math.round(map(x, right, left, 0, totalColGrow) * 100) / 100;

            if (Math.abs(nextGrow - prevGrow) < 0.05) {
                prevGrow = totalColGrow * 0.5;
                nextGrow = totalColGrow * 0.5;
            }

            visible = prevGrow === nextGrow;

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

<div class="resizer resizer--{direction}" class:dragging={isDragging}>
    <div class="resizer-hover" class:visible={visible} on:mousedown={handleMouseDown}></div>
</div>

<svelte:body on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

<style>
.resizer {
    position: relative;
}

.resizer-hover {
    position: absolute;
    z-index: 999;

    display: flex;
    justify-content: center;
    align-items: center;

    /* background: rgba(255, 0, 0, 0.5); */
}

.resizer-hover:before {
    content: '';

    width: 2px;
    height: 100%;
    
    background-color: white;
    opacity: 0;
}

.resizer-hover:hover:before {
    opacity: 0.25;
}

.resizer.dragging .resizer-hover:before {
    opacity: 0.5;
}

.resizer.dragging .resizer-hover.visible:before {
    opacity: 1;
    background-color: #177bd0;
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

.resizer--horizontal .resizer-hover:before {
    width: 100%;
    height: 2px;
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

    /* background: rgba(0, 255, 0, 0.5); */
}

</style>
