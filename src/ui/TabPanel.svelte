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
import { getContext } from "svelte";

let current;
let index;

let context = getContext('tabContext');

context.update((values) => {
    const { panels } = values;

    index = panels.length;

    return {
        ...values,
        panels: [...panels, panels.length]
    };
});

context.subscribe(({ tabIndex }) => {
    current = tabIndex === index;
});

$: className = current ? 'current' : '';
</script>