<script>
import Select from "./fields/Select.svelte";

export let type;
export let name;
export let onChange;
export let params = {};

const fields = {
    "select": Select
};

const input = fields[type];

</script>

<div class="field">
    <div class="field__name">
        <span class="field__text">{name}</span>
    </div>
    <div class="field__input">
        <svelte:component this={input} params={params} />
    </div>
</div>

<style>
.field {
    display: flex;
    width: 100%;
    justify-content: space-around;
}

.field__name {
    flex: 1.5;
}

.field__text {
    padding-left: 24px;
    
    color: #f0f0f0;
    font-size: 12px;
}

.field__input {
    flex: 0.5;
    padding-right: 4px;
}
</style>
