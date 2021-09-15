<script>
export let label = "";
</script>

<button class="module-header__action" aria-label={label} on:click>
    <div class="content">
        <slot>
        
        </slot>
    </div>
</button>

<style>
.module-header__action {
    background: transparent;
    /* opacity: 0; */
    transition: opacity 0.2s ease;
}

.content {
    opacity: 0.5;
    transition: opacity 0.2s ease;
}

.module-header__action:hover .content {
    opacity: 1;
}

</style>
