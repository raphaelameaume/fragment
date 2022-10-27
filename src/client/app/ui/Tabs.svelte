<script>
import ButtonInput from "./fields/ButtonInput.svelte";

let tabs = ["Tab1", "Tab 2", "Tab 3", "Tab 4"];
let tabIndex = 0;
</script>
<div class="tabs">
	<header class="tabs-header">
		{#each tabs as tab, index}
			<button class="tab-button" class:active={index === tabIndex} on:click={() => tabIndex = index}>
				<span class="tab-label">{tab}</span>
			</button>
		{/each}
	</header>
	<div class="tab-contents">
		{#each tabs as tab, index}
			<div class="tab-content" class:active={index === tabIndex}>
			</div>
		{/each}
	</div>
</div>

<style>
.tabs {
	padding-left: calc(12px * (var(--nesting, -1) + 1));
	border-bottom: 1px solid var(--color-spacing);
}

.tabs-header {
	--column-gap: 3px;
    --padding: 6px;
	display: grid;
	grid-template-columns: auto auto auto auto;
    width: 100%;
}

.tab-button {
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

.tab-button.active .tab-label {
	opacity: 1;
}

.tab-button:hover .tab-label {
	opacity: 1;
}

.tab-contents {
	position: relative;
	aspect-ratio: 8;
}

.tab-contents:before {
	content: "";

	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;

	width: 3px;
	height: 100%;

	background-color: var(--color-spacing);
}

.tab-content:not(.active) {
	display: none;
}


</style>
