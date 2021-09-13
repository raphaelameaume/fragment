<script>
export let name;
export let container;

</script>

<div class="module module--{name}">
    <header class="module__header">
        <h3 class="module__title">{name}</h3>
    </header>
    <div class="module__container" bind:this={container}>
        <slot></slot>
    </div>
</div>

<style>
.module__header {
    display: flex;
    height: 20px;
    align-items: center;
    justify-content: center;

    background: #0E0E0E;
}

.module__title {
    color: white;
    font-size: 10px;
    text-transform: capitalize;
}

</style>
