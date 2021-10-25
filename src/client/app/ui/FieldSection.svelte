<script>
export let className = "";
export let visible = true;
export let secondary = false;
export let label = "";
export let name = "";
export let onClickLabel = () => {};
</script>

<div class="field__section" class:visible={visible} class:secondary={secondary} class:no-label={label === null}>
    <div class="field__infos" on:click={onClickLabel}>
        {#if label !== null }
            {#if name !== ""}
                <label class="field__label" for={name}>{label}</label>
            {:else}
                <span class="field__label">{label}</span>
            {/if}
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

.field__section.no-label {
    grid-template-columns: 1fr;
}

.field__section:hover .field__label, .field__section:focus-within .field__label {
    opacity: 1;
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
    height: calc(10px + var(--margin));
    
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
    font-size: var(--inputFontSize);
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
    padding-top: 5px;

    background-color: #242425;
}

.field__section.secondary .field__infos:before {
    content: '';

    position: absolute;
    top: 10px;
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
