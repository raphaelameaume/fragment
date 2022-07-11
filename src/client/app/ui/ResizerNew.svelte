<script context="module">
export const MIN_HEIGHT_ROW = 25;
export const MIN_WIDTH_COL = 80;
</script>

<script>
import { getContext } from "svelte";
import { map, clamp } from "lemonade-math";
import { current as currentLayout } from "../stores/layout.js";

const DIRECTIONS = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
};

export let direction = DIRECTIONS.HORIZONTAL;

export let index = -1;

let isDragging = false;

const children = getContext('prevParent');

let visible = false;

let current = $children[index], next = $children[index+1];
let currentRect, nextRect;

function handleMouseDown() {
    if (!isDragging) {
        isDragging = true;

        document.body.style.userSelect = "none";
        document.body.style.cursor = direction === DIRECTIONS.HORIZONTAL ? "ns-resize" : "ew-resize";

		currentRect = current.node.getBoundingClientRect();
		nextRect = next.node.getBoundingClientRect();

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

            prevFlex = Math.round(map(y, top, bottom, 0, 1) * 10000) / 10000;
            nextFlex = Math.round(map(y, bottom, top, 0, 1) * 10000) / 10000;
        } else if (direction === DIRECTIONS.VERTICAL) {
            const left = currentRect.left;
            const right = nextRect.right;

            const x = clamp(event.clientX, left + MIN_WIDTH_COL, right - MIN_WIDTH_COL);
            prevFlex = Math.round(map(x, left, right, 0, 1) * 10000) / 10000;
            nextFlex = Math.round(map(x, right, left, 0, 1) * 10000) / 10000;
        }

		if (Math.abs(nextFlex - prevFlex) < 0.05) {
			prevFlex = 0.5;
			nextFlex = 0.5;
		}

		visible = prevFlex === nextFlex;


		$children = $children.map((p, i) => {
			if (i === index) {
				return {...p, size: prevFlex};
			} else if (i === (index + 1)) {
				return {...p, size: nextFlex};
			} else {
				return p;
			}
		});
    }
}

</script>

<div class="resizer resizer--{direction}" class:dragging={isDragging}>
    <div class="resizer-hover" class:visible={visible} on:mousedown={handleMouseDown}></div>
</div>

<svelte:body on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

<style>
.resizer {
	--area-size: 10px;
	--thickness: 2px;

    position: relative;
}

.resizer-hover {
    position: absolute;
    z-index: 100;

    display: flex;
    justify-content: center;
    align-items: center;	
}

.resizer-hover:before {
    content: '';

    width: var(--thickness);
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
    top: calc(-0.5 * var(--area-size));
    right: 0;
    bottom: calc(-0.5 * var(--area-size));
    left: 0;

    cursor: ns-resize;
}

.resizer--horizontal .resizer-hover:before {
    width: 100%;
    height: var(--thickness);
}

.resizer--vertical {
    width: 0;
}

.resizer--vertical .resizer-hover {
    top: 0;
    right: calc(-0.5 * var(--area-size));
    bottom: 0;
    left: calc(-0.5 * var(--area-size));

    cursor: ew-resize;

    /* background: rgba(0, 255, 0, 0.5); */
}

</style>
