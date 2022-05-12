<script>
export let value = null;
export let name = "";
export let label;
export let disabled = false;

</script>

<div class="button-container" class:disabled={disabled}>
    <button class="button" {disabled} on:click>
        {label}
    </button>
</div>

<style>
.button-container {
    display: flex;
    width: 100%;
}

.button {
    display: flex;
    width: 100%;
    height: var(--inputHeight);
    justify-content: center;
    align-items: center;
    padding: 0 4px;

    color: rgba(255, 255, 255, 0.5);
    font-size: var(--inputFontSize);
    
    border-radius: var(--inputBorderRadius);
    background-color: var(--background-color, var(--inputBackgroundColor));
    box-shadow: inset 0 0 0 1px var(--box-shadow-color, var(--inputBorderColor));
}

:global(.field.disabled) .button {
    color: rgba(255, 255, 255, 0.2);
}

.button:hover {
    color: var(--inputColor);

    box-shadow: inset 0 0 0 1px var(--box-shadow-color, var(--activeColor));
}

.button:active {
    box-shadow: 0 0 0 2px var(--box-shadow-color, var(--activeColor));
}
</style>
