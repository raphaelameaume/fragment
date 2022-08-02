<script>
import { createEventDispatcher } from "svelte";

import Field from "./Field.svelte";
import ButtonInput from "./fields/ButtonInput.svelte";
import Select from "./fields/Select.svelte";
import { moduleNames } from "./ModuleRenderer.svelte";

const defaultValue = "Select a module";

export let moduleName = undefined;
export let isRoot = false;
export let vertical = false;


const dispatch = createEventDispatcher();

let splitColumns = false;
let splitRows = false;

function handleModuleChange(event) {
	dispatch('change', event.detail);
}

function handleAddRow() {
	dispatch('add-row');
}

function handleAddColumn() {
	dispatch('add-column');
}

function handleDelete() {
	dispatch('delete');
}

const options = [
	{ value: undefined, label: defaultValue, disabled: true },
	...moduleNames.map((name) => ({ value: name, label: name }))
]

</script>

<div
	class="toolbar"
	class:root={isRoot}
	class:split-columns={splitColumns}
	class:split-rows={splitRows}
	
>
	<div class="content" class:vertical={vertical}>
		{#if !isRoot}
			<div class="module">
				<Select
					value={moduleName}
					options={options}
					on:change={handleModuleChange}
					title="Switch module"
				/>
			</div>
			<div class="separator"></div>
		{/if}
		<div class="layout-actions">
			<ButtonInput
				label="Split in columns"
				showLabel={false}
				title="Split in columns"
				on:mouseenter={() => splitColumns = true}
				on:mouseleave={() => splitColumns = false}
				on:click={handleAddColumn}
			>
				<div class="icon-layout">
					<div class="icon-box"></div>
					<div class="icon-box"></div>
				</div>
			</ButtonInput>
			<ButtonInput
				label="Split in rows"
				showLabel={false}
				title="Split in rows"
				on:mouseenter={() => splitRows = true}
				on:mouseleave={() => splitRows = false}
				on:click={handleAddRow}
			>
				<div class="icon-layout row">
					<div class="icon-box"></div>
					<div class="icon-box"></div>
				</div>
			</ButtonInput>
			{#if !isRoot}
				<div class="layout-delete">
					<ButtonInput
						label="Delete"
						showLabel={false}
						on:click={handleDelete}
						--color-text="white"
						--background-color="var(--color-red)"
						--box-shadow-color-active="var(--color-lightred)"
					>
						<div class="icon-cross">
							<div class="icon-cross-side"></div>
							<div class="icon-cross-side"></div>
						</div>
					</ButtonInput>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
.toolbar {
	position: absolute;
	top: 0;
	left: 0;
	/* z-index: 200; */

	display: grid;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 6px;
}

.toolbar:not(.root) {
	background: rgba(0, 0, 0, 0.8);
}

.toolbar:after {
	content: '';

	position: absolute;
	right: 0;
	z-index: 100;

	width: 6px;
	height: 100%;

	background-color: rgba(255, 255, 255, 0.2);
	opacity: 0;
	pointer-events: none;
	transition: opacity 100ms ease;
}

.toolbar.split-columns:after {
	opacity: 1;
}

.toolbar:before {
	content: '';

	position: absolute;
	left: 0;
	bottom: 0;

	width: 100%;
	height: 6px;

	background-color: rgba(255, 255, 255, 0.2);
	opacity: 0;
	transition: opacity 100ms ease;
}

.toolbar.split-rows:before {
	opacity: 1;
}

.toolbar.root {
	align-items: flex-start;

	pointer-events: none;
}

.module {
	max-width: 130px;
	width: 100%;
}

.icon-cross {
	position: relative;
	width: 100%;
	height: 100%;
}

.icon-cross-side {
	--size: 10px;
	position: absolute;
	top: calc(50% - 1px);
	left: calc(50% - var(--size) * 0.5);
	width: var(--size);
	height: 2px;

	transform: rotate(45deg);

	background-color: #551717;
}

.icon-cross-side:last-child {
	transform: rotate(-45deg);
}

.icon-layout {
	display: grid;
	gap: 2px;
	grid-template-columns: 1fr 1fr;
	align-content: stretch;
}

.icon-box {
	width: 4px;
	height: 10px;
	border: 1px solid rgba(255, 255, 255, 0.5);
	border-radius: 1px;
}

:global(.button:hover) .icon-box {
	border-color: rgba(255, 255, 255, 1);
}

.icon-layout.row {
	transform: rotate(90deg);
}

.separator {
	--size: 20px;

	position: relative;

	width: var(--size);
	height: 100%;
	flex-shrink: 0;
}

.content.vertical .separator {
	width: 100%;
	height: calc(var(--size) * 0.25);
	opacity: 0;
}

.separator:after {
	--size: 10px; 
	content: "";

	position: absolute;
	top: calc(50% - var(--size) * 0.5);
	left: calc(50% - 1px);

	width: 1px;
	height: var(--size);

	background-color: var(--color-border-input);
}


.content.vertical .separator:after {
	top: calc(50% - 1px);
	left: calc(50% - var(--size) * 0.5);

	width: var(--size);
	height: 1px;
}

.content {
	position: relative;

	display: flex;
	align-items: center;
	padding: 6px;
	border-radius: var(--border-radius-input); 
	background-color: var(--color-background);
	border: 1px solid #555;
	/* background: rgba(0, 0, 0, 0.8); */

	pointer-events: auto;
}

.content.vertical {
	flex-direction: column-reverse;
}

.toolbar.root .content {
	margin-top: 25px;
	border-style: dashed;
}

.content:hover {
	border-color: #666;
}

.layout-actions {
	display: flex;
	gap: 5px;
}
</style>
