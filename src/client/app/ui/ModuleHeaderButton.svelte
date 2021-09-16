<script>
export let label;
</script>

<button class="module-header-action__button" aria-label={label} on:click>
    <slot></slot>
</button>

<style>
.module-header-action__button {
    background: transparent;
    /* opacity: 0.5; */
    display: flex;
    transition: opacity 0.2s ease;
}

.module-header-action__button:hover {
    opacity: 1;
}
</style>
