<div class="dropdown">
    <button class="button" on:click={toggle}>
        <span class="toggle"></span>
        <span class="label">{title}</span>
    </button>
    <div class="content {classNameVisible}">
        <slot></slot>
    </div>
</div>

<style>
.button {
    position: relative;

    display: flex;
    width: 100%;
    padding: 4px;
    margin: 0;
    margin-bottom: 1px;
    border-radius: 4px;
    background: #1d1d1e;
    border: 1px solid black;
    color: #f0f0f0;
}

.toggle {
    width: 20px;
    height: 4px;
    margin-right: 10px;

    background: red;
}

.label {
    width: 100%;
    text-align: left;
    font-size: 10px;
}

.content {
    display: none;
}

.content.visible {
    display: block;
}

</style>

<script>
export let title = "";
export let opened = true;

$: classNameVisible = opened ? 'visible' : '';

function toggle() {
    opened = !opened;
}

</script>