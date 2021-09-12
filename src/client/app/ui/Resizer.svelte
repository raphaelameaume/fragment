<div class="resizer">
    <div class="resizer-hover" on:mousedown={handleMouseDown}></div>
</div>

<svelte:body on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

<style>
.resizer {
    position: relative;
    height: 0px;
}

.resizer-hover {
    position: absolute;
    top: -4px;
    left: 0;
    right: 0;
    bottom: -4px;
    z-index: 999;

    cursor: ns-resize;

    background: rgba(255, 0, 0, 0.5);
}
</style>

<script>
export let prevIndex;
export let nextIndex;
export let onDragStart;
export let onDragEnd;
export let onDrag;

let isDragging = false;

function handleMouseDown() {
    if (!isDragging) {
        isDragging = true;
        onDragStart({ prevIndex, nextIndex, event });
    }
}

function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        onDragEnd({ prevIndex, nextIndex, event })
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        onDrag({ prevIndex, nextIndex, event });
    }
}





</script>
