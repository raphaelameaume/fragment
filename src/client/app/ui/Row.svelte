<div class="row">
    <header class="header">
        <button>Add column</button>
        <button>X</button>
    </header>
    <div class="container">
        <slot></slot>
    </div>
</div>

<style>
.row {
    display: flex;
    justify-content: stretch;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #AA0000;
}

.header {
    flex-grow: 0;
}

.container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-grow: 1;
}
</style>
