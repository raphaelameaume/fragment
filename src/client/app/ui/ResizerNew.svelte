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
export let index = -1;

let isDragging = false;

const parent = getContext(direction === DIRECTIONS.HORIZONTAL ? "col" : "row");

$: currentRow = $currentLayout.content[rowIndex];
$: nextRow = $currentLayout.content[rowIndex + 1];

$: currentCol = colIndex >= 0 ? currentRow.content[colIndex] : null;
$: nextCol = currentCol ? currentRow.content[colIndex + 1] : null;

let currentRowRect, nextRowRect;
let currentColRect, nextColRect;
let totalRowFlex = 0;
let totalColFlex = 0;

let visible = false;

const MIN_WIDTH_COL = 100;
const MIN_HEIGHT_ROW = 25;

let current = $parent[index], next = $parent[index+1];
let currentRect, nextRect;
let totalFlex;

function handleMouseDown() {
    if (!isDragging) {
        isDragging = true;

        document.body.style.userSelect = "none";
        document.body.style.cursor = direction === DIRECTIONS.HORIZONTAL ? "ns-resize" : "ew-resize";

		console.log(current, next, $parent);

		currentRect = current.node.getBoundingClientRect();
		nextRect = next.node.getBoundingClientRect();

        totalFlex = current.size + next.size;

		visible = current.size === next.size;
    }
}

function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        visible = false;
        document.body.style.userSelect = null;
        document.body.style.cursor = null;
    }
}

function handleMouseMove(event) {
    if (isDragging) {
		let prevFlex, nextFlex;

        if (direction === DIRECTIONS.HORIZONTAL) {
            const top = currentRect.top;
            const bottom = nextRect.bottom;

            const y = clamp(event.clientY, top + MIN_HEIGHT_ROW, bottom - MIN_HEIGHT_ROW); 

            prevFlex = Math.round(map(y, top, bottom, 0, totalFlex) * 10000) / 10000;
            nextFlex = Math.round(map(y, bottom, top, 0, totalFlex) * 10000) / 10000;

            if (Math.abs(nextFlex - prevFlex) < 0.05) {
                prevFlex = 1 * 0.5;
                nextFlex = 1 * 0.5;
            }
        } else if (direction === DIRECTIONS.VERTICAL) {
            const left = currentRect.left;
            const right = nextRect.right;

            const x = clamp(event.clientX, left + MIN_WIDTH_COL, right - MIN_WIDTH_COL);
            prevFlex = Math.round(map(x, left, right, 0, totalFlex) * 10000) / 10000;
            nextFlex = Math.round(map(x, right, left, 0, totalFlex) * 10000) / 10000;

            if (Math.abs(nextFlex - prevFlex) < 0.05) {
                prevFlex = totalFlex * 0.5;
                nextFlex = totalFlex * 0.5;
            }
        }

		visible = prevFlex === nextFlex;

		$parent = $parent.map((p, i) => {
			if (i === index) {
				return { ...p, size: prevFlex };
			} else if (i === (index + 1)) {
				return {...p, size: nextFlex};
			} else {
				return p;
			}
		});
    }
}

</script>

<div class="resizer resizer--{direction}" class:dragging={isDragging} style={`--z-index: ${direction === DIRECTIONS.VERTICAL ? (rowIndex + 11) : (rowIndex + 13)};`}>
    <div class="resizer-hover" class:visible={visible} on:mousedown={handleMouseDown}></div>
</div>

<svelte:body on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

<style>
.resizer {
    position: relative;
}

.resizer-hover {
    position: absolute;
    z-index: var(--z-index);

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
