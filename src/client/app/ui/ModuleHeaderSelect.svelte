<script>
export let value;
export let options = [];
</script>

<div class="module-header-select">
    <select class="select" on:change bind:value={value}>
        {#each options as option}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
    <div class="chevrons">
        <svg class="chevron chevron-bottom" width="15" height="15" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.25 10.75L12 14.25L8.75 10.75"></path>
        </svg>
    </div>
</div>

<style>
.module-header-select {
    position: relative;
    
    display: flex;
}

.select {
    font-family: "Jetbrains Mono";
    font-size: 10px;
    padding: 1px 15px 1px 3px;
    
    color: inherit;
    background: transparent;
    
    outline: 0;
}

.chevrons {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    width: 15px;

    color: rgba(255, 255, 255, 0.75);
    pointer-events: none;
}

</style>
