<div class="tabs">
    <slot></slot>
</div>

<style>
.tabs {
    position: relative;

    width: 100%;
}
</style>

<script>
export let tabIndex = 0;
import { writable } from 'svelte/store';
import { setContext } from 'svelte';

let tabs = writable({
    tabs: [],
    panels: [],
    tabIndex: tabIndex,
});

setContext('tabContext', tabs);

</script>