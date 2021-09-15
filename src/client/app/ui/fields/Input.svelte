<script>
export let name;
export let label;
export let value;

let el;

</script>

<div class="container">
    {#if label }
        <span class="label">{label}</span>
    {/if}
    <input
        class="input"
        type="text"
        bind:this={el}
        bind:value={value}
        name={name}
        on:change
        on:input
        on:keypress
        on:keydown
        on:focus
        on:blur
        autocomplete="off"
        spellcheck="false"
    />
</div>

<style>
.container {
    position: relative;

    display: flex;
    height: var(--inputHeight);

    border-radius: var(--borderRadius);
    background-color: var(--backgroundColor);
    box-shadow: inset 0 0 0 1px var(--borderColor);

    margin-right: calc(var(--padding));
}

.container:hover {
    box-shadow: inset 0 0 0 1px var(--activeColor);
}

.container:focus-within {
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

    color: var(--color);
    font-size: var(--fontSize);
    font-family: var(--fontFamily);
    font-weight: 600;
    pointer-events: none;
    opacity: 0.35;
}

.input {
    width: 100%;
    height: 100%;
    padding: 0 var(--padding);

    color: rgba(255, 255, 255, 0.5);
    font-size: var(--fontSize);
    text-align: right;

    background: transparent;
    outline: 0;
}

:global(.field:hover .container .input) {
    color: var(--color);
}

input:focus {
    color: var(--color);
}

/* .input:focus {
    border: var(--borderWidth) solid var(--activeColor);
} */

</style>
