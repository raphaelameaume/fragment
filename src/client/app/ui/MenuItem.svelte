<script>
export let label;
export let index;
export let action;
export let selected;
export let actions;
export let hoverable;
export let onClick;

function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    onClick(index);
}

function handleMouseEnter(event) {
    if (hoverable) {
        onClick(index);
    }
}

</script>

<li class="list__item { selected ? `list__item--selected` : `` }">
    <button class="item__label" on:click={handleClick} on:mouseenter={handleMouseEnter}>{label}</button>
    <ul class="sublist { selected ? `sublist--selected` : `` }">
        {#each actions as action}
            <li class="sublist__item">
                {#if action.handler }
                    <button class="sublist__label" on:click={action.handler}>{action.label}</button>
                {:else}
                    <span class="sublist__label">{action.label}</span>
                {/if}
            </li>
        {/each}
    </ul>
</li>

<style>

.list__item {
    position: relative;
    cursor: default;
}

.list__item--selected {
    background-color: #177bd0;
}

.item__label {
    color: #f0f0f0;
    font-size: 14px;
    padding: 0 8px;
    border: none;
    background: none;
    user-select: none;
}

.sublist {
    position: absolute;
    left: 0;
    top: 100%;
    z-index: 100;

    display: none;
    padding-top: 4px;
    padding-bottom: 8px;
    border-radius: 0 0 2px 2px;

    background-color: rgba(20, 20, 20, 0.75);
    backdrop-filter: blur(2px);
}

.list__item--selected .sublist {
    display: block;
}

.sublist__item {
    padding-left: 24px;
    padding-right: 24px;
}

.sublist__label {
    width: max-content;
    background: none;
    border: none;
    font-size: 12px;
    color: #f0f0f0;
    padding: 0;
    margin: 0;
}
</style>
