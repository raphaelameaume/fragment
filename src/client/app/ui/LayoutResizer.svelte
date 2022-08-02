<script context="module">
export const MIN_HEIGHT_ROW = 25;
export const MIN_WIDTH_COL = 25;
export const DIRECTIONS = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
}; 
</script>

<script>
import { getContext, tick } from "svelte";
import { map, clamp } from "lemonade-math";
import { current as currentLayout, resize, traverse, tree } from "../stores/layout.js";

export let direction = DIRECTIONS.HORIZONTAL;
export let current;
export let parent = {};

const { children } = parent;

let visible = false;
let isDragging = false;
let next;

function findNext() {
	if (children && current.node && current.node) {
		const { parentNode } = current.node;
		const childNodes = [...parentNode.children]

		const index = childNodes.findIndex(c => c === current.node);
		const nextNode = childNodes[index+2];

		next = $children.find(c => c.node === nextNode);

		traverse((c) => {
			if (c.id === next.id) {
				nextSize = c.size;
			}

			if (c.id === current.id) {
				currentSize = c.size;
			}
		}, $tree);
	}
}

let currentRect, nextRect;
let currentSize, nextSize, totalSize;

function handleMouseDown() {
	findNext();

    if (!isDragging && next) {
        isDragging = true;

        document.body.style.userSelect = "none";
        document.body.style.cursor = direction === DIRECTIONS.HORIZONTAL ? "ns-resize" : "ew-resize";

		totalSize = currentSize + nextSize;

		currentRect = current.node.getBoundingClientRect();
		nextRect = next.node.getBoundingClientRect();

		visible = currentSize === nextSize;
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
	if (!isDragging) return;
	let prevFlex, nextFlex;

	if (direction === DIRECTIONS.HORIZONTAL) {
		const top = currentRect.top;
		const bottom = nextRect.bottom;

		const y = clamp(event.clientY, top, bottom);

		prevFlex = Math.round(map(y, top, bottom, 0, totalSize) * 10000) / 10000;
		nextFlex = Math.round(map(y, bottom, top, 0, totalSize) * 10000) / 10000;
	} else if (direction === DIRECTIONS.VERTICAL) {
		const left = currentRect.left;
		const right = nextRect.right;

		const x = clamp(event.clientX, left + MIN_WIDTH_COL, right - MIN_WIDTH_COL);
		prevFlex = Math.round(map(x, left, right, 0, totalSize) * 10000) / 10000;
		nextFlex = Math.round(map(x, right, left, 0, totalSize) * 10000) / 10000;
	}

	let totalWidth = currentRect.width + nextRect.width;
	let totalHeight = currentRect.height + nextRect.height;
	


	if (Math.abs(nextFlex - prevFlex) < 0.05) {
		prevFlex = totalSize * 0.5;
		nextFlex = totalSize * 0.5;
	}

	let ratioWidth = totalWidth / totalSize;
	let ratioHeight = totalHeight / totalSize;
	
	visible = prevFlex === nextFlex;

	function isMinimized(size) {
		return size * (direction === DIRECTIONS.HORIZONTAL ? ratioHeight : ratioWidth) <= 25;
	}

	if (isMinimized(prevFlex)) {
		nextFlex = totalSize;
		prevFlex = 0;
	} else if (isMinimized(nextFlex)) {
		prevFlex = totalSize;
		nextFlex = 0;
	}

	resize([
		{ id: current.id, size: prevFlex },
		{ id: next.id, size: nextFlex }
	]);
}

</script>

<div class="resizer resizer--{direction}" class:dragging={isDragging} class:editing={$currentLayout.editing}>
	<div class="resizer-hover" class:visible={visible} on:mousedown={handleMouseDown}></div>
</div>
<svelte:window on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

<style>
.resizer {
	--area-size: 10px;
	--thickness: 2px;

    position: relative;
}

.resizer:last-child {
	display: none;
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

.resizer.editing .resizer-hover:before {
    opacity: 0.1;
}

.resizer .resizer-hover:hover:before {
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

    cursor: row-resize;
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

    cursor: col-resize;

    /* background: rgba(0, 255, 0, 0.5); */
}

</style>
