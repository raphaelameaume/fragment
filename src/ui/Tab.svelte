<li class="tab {className}">
    <button class="tab__button" on:click={handleClick}><slot></slot></button>
</li>

<style>
.tab {
    padding: 0;
    margin: 0;
}

.tab.current {
    border-bottom: 1px solid black;
}

.tab__button {
    width: 100%;
    height: 100%;

    -webkit-appearance: none;
    background: transparent;
    border: none;
    padding: 10px;
    margin: 0;
}

</style>

<script>
import { beforeUpdate } from "svelte";


export let onClick;
export let current;

$: className = current ? 'current' : '';

function handleClick(event) {
    console.log('handle click');
    console.log(onClick);
    onClick(event);
}

</script>