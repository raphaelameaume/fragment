<script>
import ModuleHeaderSelect from "./ModuleHeaderSelect.svelte";
import ModuleHeaderButton from "./ModuleHeaderButton.svelte";

export let label = "";
export let permanent = false;
export let value = null;
export let border = false;
export let margin = true;
export let options = [];

$: disabled = options.length === 1;

</script>

<div class="module-header-action" class:permanent={permanent} class:border={border} class:no-margin={!margin} class:disabled={disabled}>
    {#if options.length > 0}
        <ModuleHeaderSelect {options} {value} {disabled} on:change/>
    {:else}
        <ModuleHeaderButton label={label} on:click>
            <slot name="text">
                <div class="text">
                    <slot>{label}</slot>
                </div>
            </slot>
            <slot name="icon"></slot>
        </ModuleHeaderButton>
    {/if}
</div>


<style>
.module-header-action {
    display: flex;
    align-items: center;

    color: rgba(255, 255, 255, 0.75);

    margin: 0 2px;
}

.module-header-action:not(.disabled):hover {
    color: rgba(255, 255, 255, 1);
}

.text:not(:empty) {
    color: inherit;
    background: transparent;
    width: 100%;
    font-size: 10px;

    padding: 1px 3px 1px 3px;
}

.module-header-action.no-margin {
    margin: 0;
}

.module-header-action.border {
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, 0.25);
}

.module-header-action:not(.disabled).border:hover {
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.module-header-action:first-child {
    margin-left: 0;
}

.module-header-action:last-child {
    margin-right: 0;
}

.module-header-action:not(.permanent) {
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
}

:global(.module__header:hover .module-header-action:not(.permanent)) {
    opacity: 1;
    pointer-events: auto;
}

</style>
