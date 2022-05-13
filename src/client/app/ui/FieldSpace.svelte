<script>
export let height = 20;
</script>

<div class="field-space" style="height: {height}px"></div>

<style>
.field-space {
    position: relative;

    border-bottom: 1px solid var(--color-spacing);
    overflow: hidden;
}

.field-space:before, .field-space:after {
    /* content: ''; */
    position: absolute;
    top: 50%;
    left: 0;

    width: 100%;
    height: 1px;

    background-color: var(--color-spacing);
}

.field-space:before {
    transform: rotate(3deg);
}

.field-space:after {
    content: none;
    transform: rotate(-3deg);
}


</style>
