<script>
import { writable } from "svelte/store";
import { afterUpdate, onDestroy, setContext } from "svelte";

export let instance = null;

let tabIndex = writable(-1);
let tabs = writable([]);

const context = {
	tabIndex,
	tabs,
	registerTab: (tab) => {
		const index = $tabs.length;
		$tabs = [...$tabs, tab];

		if (tab.active) {
			$tabIndex = index;
		}

		onDestroy(() => {
			$tabs = $tabs.filter(t => t !== tab);
		});
	},
	updateTab: (tab, props = {}) => {
		const index = $tabs.indexOf(tab);

		$tabs = $tabs.map((t) => {
			if (t === tab) {
				Object.assign(tab, props);
			}

			return t;
		});

		if (props.active) {
			$tabIndex = index;
		}
	}
};

setContext('tabs', context);

$: {
	// reattach tabIndex store to tabs instance when instance changes
	if (instance) {
		instance.tabIndex = tabIndex;
	}
}

</script>

<div class="tabs">
	<header class="tabs-header" role="tablist" aria-orientation="horizontal">
		{#each $tabs as tab, index}
			<button class="tab-button" class:active={index === $tabIndex} on:click={() => $tabIndex = index} role="tab" aria-selected={index === $tabIndex}>
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
	--border-color: var(--color-spacing);
	--border-width: 3px;

	position: relative;
}


.tabs:after {
	/* content: ""; */

	--left: calc((var(--nesting, -1) + 1) * 12px);

	position: absolute;

	left: var(--left, 0px);
	bottom: 0px;
	z-index: 3;

	width: calc(100% - var(--left));
	height: 1px;

	background-color: var(--color-spacing);
}

.tabs-header {
	--column-gap: 3px;
    --padding: 6px;
	display: flex;
	justify-content: flex-start;
    width: calc(100% - var(--left1, 0px));
	margin-left: var(--left1, 0px);
	border-top: var(--border-width) solid var(--border-color);
	border-bottom: calc(var(--border-width) + 1px) solid var(--border-color);
}

.tab-button {
	position: relative;
	width: 100%;
	height: 26px;

	color: #f0f0f0;
	font-size: 11px;
    /* font-weight: 700; */

	background-color: transparent;
	border-left: 4px solid var(--border-color);
	/* border-width: 0px;
	border-style: solid;
	border-color: var(--color); */
	/* background-color: transparent; */
	cursor: pointer;
	/* border: 1px solid var(--color-spacing); */
}

.tab-button:hover {
	opacity: 1;
}

.tab-button:not(:last-child) {
	/* border-right: 1px solid var(--color-background); */
}

.tab-label {
	opacity: 0.6;
	transition: opacity 0.1s ease;
}

.tab-button.active {
	background-color: var(--border-color);
	/* border-radius: 3px; */
	/* border-color: transparent; */
}

.tab-button.active .tab-label {
	opacity: 1;
}

.tab-button:hover .tab-label {
	opacity: 1;
}


.tab-contents {
	padding-bottom: var(--border-width);
	min-height: calc(var(--border-width) * 3);
}

/* border left */
.tab-contents:before {
	content: "";

	position: absolute;
	top: 0;
	bottom: 0;
	left: calc(var(--left1, 0px));
	/* z-index: 1; */

	width: calc(var(--border-width) + 1px);
	height: 100%;

	background: var(--border-color);
}

/* border-bottom */
.tab-contents:after {
	content: "";

	--left: calc(12px * calc(var(--nesting, -1) + 1));

	position: absolute;

	left: var(--left);
	bottom: 0px;

	width: calc(100% - var(--left));
	height: calc(var(--border-width) + 1px);

	background-color: var(--border-color);
}




</style>
