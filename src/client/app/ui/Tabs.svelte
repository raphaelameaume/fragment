<script>
import { writable } from "svelte/store";
import { setContext } from "svelte";

let tabs = writable([]);
let tabIndex = writable(0);

setContext('tabs', tabs);
setContext('tabIndex', tabIndex);

$: console.log("rerender tabs", $tabs);
</script>

<div class="tabs">
	<header class="tabs-header" role="tablist" aria-orientation="horizontal">
		{#each $tabs as tab, index}
			<button class="tab-button" class:empty={tab.empty} class:active={index === $tabIndex} on:click={() => $tabIndex = index} role="tab" aria-selected={tabIndex === index}>
				<span class="tab-label">{tab.label}</span>
			</button>
		{/each}
	</header>
	<div class="tab-contents" role="tabpanel">
		<slot></slot>
	</div>
</div>

<style>
.tabs {
	position: relative;
	/* border-bottom: 1px solid var(--color-spacing); */
}

.tabs-header {
	--column-gap: 3px;
    --padding: 6px;
	display: flex;
	justify-content: flex-start;
    width: 100%;
	padding-left: calc(12px * (var(--nesting, -1) + 1));
}

.tab-button {
	position: relative;
	width: 100%;
	height: 26px;

	color: #f0f0f0;
	font-size: 11px;
    /* font-weight: 700; */

	background-color: #1d1d1e;
	/* background-color: transparent; */
	cursor: pointer;
	border-bottom: 1px solid var(--color-spacing);
}

.tab-button:hover {
	opacity: 1;
}

.tab-button:not(:last-child) {
	border-right: 1px solid var(--color-spacing);
}

.tab-label {
	opacity: 0.6;
	transition: opacity 0.1s ease;
}

.tab-button.active {
	background-color: transparent;
	border-color: var(--color-spacing) var(--color-spacing) transparent;
}

.tab-button.empty.active {
	border-color: var(--color-spacing);
}

.tab-button.active .tab-label {
	opacity: 1;
}

.tab-button:hover .tab-label {
	opacity: 1;
}

.tab-contents:before {
	content: "";

	position: absolute;
	top: 0;
	bottom: 0;
	left: calc(12px * (var(--nesting, -1) + 1));

	width: 3px;
	height: 100%;

	background-color: var(--color-spacing);
}



</style>
