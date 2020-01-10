<div class="output" bind:this={element}>

</div>

<script>

// props
export let renderer;
export let stages;

// variables
let element;

</script>

<style>
.output {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
}
</style>