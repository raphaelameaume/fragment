<script>
export let name;
export let grow;
export let container;

</script>

<div class="module module--{name}" style="flex: {grow}">
    {#if name}
        <header class="module__header">
            <h3 class="module__title">{name}</h3>
        </header>
    {/if}
    <div class="module__container" bind:this={container}>
        <slot></slot>
    </div>
</div>

<style>
.module {
    display: flex;
    flex-direction: column;
}

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

.module__container {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
}

</style>
