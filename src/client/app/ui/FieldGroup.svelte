<script>
export let name;

export let collapsed = false;

function handleClick() {
    collapsed = !collapsed;
}

</script>

<div class="field-group {collapsed ? "collapsed" : ""}">
    <header class="header">
        <button class="header__action" on:click={handleClick}>
            <svg class="header__icon" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.75 8.75L14.25 12L10.75 15.25"/>
            </svg>
            <span class="field-group__name">{name}</span>
        </button>
    </header>
    <div class="content">
        <slot></slot>
    </div>
</div>

<style>
.field-group {
    position: relative;

    display: grid;
    width: 100%;
}

.field-group:after {
    content: "";

    position: absolute;
    left: 0;
    bottom: 0px;
    
    width: 12px;
    height: 1px;
    
    background-color: #323233;
}

.header {
    border-bottom: 1px solid #323233;
}

.header__action {
    display: flex;
    align-items: center;
    width: 100%;
    text-align: left;

    background: transparent;
    cursor: pointer;
}

.header__icon {
    padding-bottom: 1px;

    color: #f0f0f0;
    transform: rotate(90deg);
    opacity: 0.5;
    transition: opacity 0.1s ease;
}

.header__action:hover .header__icon {
    opacity: 1;
}

.field-group.collapsed .header__icon {
    transform: rotate(0deg);
}

.field-group__name {
    color: #f0f0f0;

    font-size: 11px;
    font-family: "Jetbrains Mono";
    font-weight: 700;
    /* text-transform: uppercase; */

    opacity: 0.75;
    transition: opacity 0.1s ease;
}

.header__action:hover .field-group__name {
    opacity: 1;
}

.content {
    margin-left: 12px;
    border-left: 1px solid #323233;
}

.field-group.collapsed .content {
    display: none;
}
</style>
