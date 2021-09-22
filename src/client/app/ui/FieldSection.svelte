<script>
export let className = "";
export let visible = true;
export let secondary = false;
export let label = "";
export let name = "";
export let onClickLabel = () => {};

</script>

<div class="field__section" class:visible={visible} class:secondary={secondary}>
    <div class="field__infos">
        {#if name !== ""}
            <label class="field__label" for={name} on:click={onClickLabel}>{label}</label>
        {:else}
            <span class="field__label" on:click={onClickLabel}>{label}</span>
        {/if}
        <slot name="infos"></slot>
    </div>
    <div class="field__input">
        <slot></slot>
    </div>
</div>

<style>
.field__section {
    position: relative;
    
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    column-gap: 10px;
}

.field__section:not(.visible) {
    display: none;
}

.field__section.secondary {
    --margin: 15px;

    grid-template-columns: 0.25fr 1fr;
    margin-top: var(--margin);
}

.field__section.secondary:before {
    content: '';

    position: absolute;
    left: 10px;
    top: calc(var(--margin) * -1);

    width: 1px;
    height: calc(7px + var(--margin));
    
    background-color: var(--spacingColor);
}

.field__infos {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;
    
    color: #f0f0f0;
}

.field__label {
    font-size: var(--fontSize);
    font-family: var(--fontFamily);
    user-select: none;

    opacity: 0.5;
    transition: opacity 0.1s ease;
}

.field__section.secondary .field__infos {
    justify-content: flex-end;
    align-items: flex-start;
}

.field__section.secondary .field__label {
    position: relative;

    padding-left: 5px;

    opacity: 1;
    background-color: #242425;
}

.field__section.secondary .field__infos:before {
    content: '';

    position: absolute;
    top: 7px;
    left: 10px;
    height: 1px;
    width: calc(100% - 15px);
    background-color: #323233;
    /* background-color: red; */
}

.field__input {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

:global(.field__input > div:not(:first-child)) {
    margin-top: 3px;
}
</style>
