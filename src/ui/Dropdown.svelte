<div class="dropdown">
    <button class="button">
        <span class="toggle"></span>
        <span class="label">{title}</span>
    </button>
    <div class="content">
    
    </div>
    <slot></slot>
</div>

<style>
.button {
    position: relative;

    display: flex;
    width: 100%;
    padding: 4px;
    margin: 0;
    border-radius: 4px;
    border: 1px solid grey;
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
</style>

<script>
export let title = "";
export let opened = false;

</script>