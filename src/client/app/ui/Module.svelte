<script>
export let name;
</script>

<div class="module">
    <p class="name">{name}</p>
</div>

<style>
.module {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-right: 2px;
}

.module:not(:last-child) {
    margin-bottom: 2px;
}

.name {
    color: white;
    text-transform: uppercase;
    text-align: center;
    font-size: 10px;
}
</style>
