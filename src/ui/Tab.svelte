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
import { beforeUpdate, getContext } from "svelte";

let current;
let context = getContext('tabContext');
let index;

context.update((values) => {
    const { tabs } = values;

    index = tabs.length;

    return {
        ...values,
        tabs: [...tabs, tabs.length],
    };
});

$: className = current ? 'current' : '';

context.subscribe(({ tabIndex }) => {
    current = tabIndex === index;
});


function handleClick(event) {
    context.update((values) => {
        return {
            ...values,
            tabIndex: index,
        };
    })
}

</script>