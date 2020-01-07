<div class="tab__panel {className}">
    <slot></slot>
</div>

<style>
.tab__panel {
    display: none;
    height: calc(100% - 36px);
    overflow-y: auto;
}

.tab__panel::-webkit-scrollbar {
    height: 100%;
    width: 7px;
    background: #000;
}

.tab__panel::-webkit-scrollbar-thumb {
    height: 4px;
    background: #448eea;
    border-radius: 5px;
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