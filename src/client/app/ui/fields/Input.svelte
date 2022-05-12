<script>
export let name;
export let label = null;
export let value;
export let disabled = false;

let el;

</script>

<div class="input-container" class:disabled={disabled}>
    {#if label }
        <span class="label">{label}</span>
    {/if}
    <input
        class="input"
        bind:this={el}
        bind:value={value}
        name={name}
        on:change
        on:input
        on:keypress
        on:keydown
        on:focus
        on:blur
        {disabled}
        autocomplete="off"
        spellcheck="false"
    />
</div>

<style>
.input-container {
    position: relative;

    display: flex;
    height: var(--inputHeight);
    margin: 2px 0;

    border-radius: var(--inputBorderRadius);
    background-color: var(--inputBackgroundColor);
    box-shadow: inset 0 0 0 1px var(--inputBorderColor);
}

.input-container:not(.disabled):hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.input-container:not(.disabled):focus-within {
    box-shadow: 0 0 0 2px var(--activeColor);
}

.label {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    padding: var(--padding);

    color: var(--inputColor);
    font-size: var(--inputFontSize);
    font-weight: 600;
    pointer-events: none;
    opacity: 0.35;
}

.input-container.disabled .label {
    opacity: 0.15;
}

.input {
    width: 100%;
    height: 100%;
    padding: 0 var(--padding);

    color: rgba(255, 255, 255, 0.5);
    font-size: var(--inputFontSize);
    text-align: right;

    background: transparent;
    outline: 0;
}

:global(.field.disabled) .input {
    opacity: 0.4;
}

:global(.field__section:hover .container .input) {
    color: var(--inputColor);
}

input:focus {
    color: var(--inputColor);
}

/* .input:focus {
    border: var(--borderWidth) solid var(--activeColor);
} */

</style>
