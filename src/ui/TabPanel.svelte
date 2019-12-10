<div class="tab__panel {className}">
    <slot></slot>
</div>

<style>
.tab__panel {
    display: none;
}

.tab__panel.current {
    display: block;
}
</style>

<script>
export let current = false;

$: className = current ? 'current' : '';


</script>