<div class="panel" style={`width: ${width}; height: ${height};`}>
    {#if title !== ''}
    <header class="header">
        <h3 class="title">{title}</h3>
        <slot name="header"></slot>
    </header>
    {/if}
    <div class="content" style={`flex-direction: ${direction}`}>
        <slot></slot>
    </div>
</div>

<style>
.panel {
    position: relative;

    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    margin-bottom: 1px;
}

.content {
    display: flex;
    width: 100%;
    height: 100%;
    overflow-y: auto;
}

.content::-webkit-scrollbar {
    height: 100%;
    width: 7px;
    background: #000;
    border-radius: 5px;
}

.content::-webkit-scrollbar-thumb {
    /* height: 4px; */
    background: #448eea;
    border-radius: 5px;
}

.title {
    padding-left: 20px;
    margin-right: 10px;
    flex-shrink: 0;
}
</style>

<script>
export let width = '100%';
export let height = '100%';
export let direction = 'row';
export let title = '';

</script>