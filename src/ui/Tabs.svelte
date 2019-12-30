<div class="tabs">
    <slot></slot>
</div>

<style>


.tabs {
    position: relative;

    height: 100%;
}
</style>

<script>
import { writable } from 'svelte/store';
import { setContext } from 'svelte';

let tabs = writable({
    tabs: [],
    panels: [],
    tabIndex: 0,
});

setContext('tabContext', tabs);

</script>