<script>
export let value;
export let label;
export let disabled;

</script>

<button class="button" on:click>
    {label}
</button>

<style>
.button {
    display: flex;
    width: 100%;
    height: var(--inputHeight);
    margin: 2px 0;
    justify-content: center;
    align-items: center;
    
    border-radius: var(--borderRadius);
    background-color: var(--backgroundColor);
    box-shadow: inset 0 0 0 1px var(--borderColor);

    margin-right: calc(var(--padding));
}

.button:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.button:active {
    box-shadow: 0 0 0 2px var(--activeColor);
}
</style>
