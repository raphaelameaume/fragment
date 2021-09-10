<div class="column">
    <header class="header">
        <button>Add module</button>
        <button>X</button>
    </header>
    <div class="container">
        <slot></slot>
    </div>
</div>

<style>
.column {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    width: 100%;
    height: 100%;
    padding: 2px;
    border: 2px solid white;
}

.container {
    overflow-y: scroll;
    flex-grow: 1;
}
</style>
