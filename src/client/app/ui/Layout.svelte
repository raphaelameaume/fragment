<script>
	import Root from './LayoutRoot.svelte';
	import Column from './LayoutColumn.svelte';
	import Build from './Build.svelte';
	import Row from './LayoutRow.svelte';
	import ModuleRenderer from './ModuleRenderer.svelte';
	import { layout } from '../state/layout.svelte.js';
	import KeyBinding from '../components/KeyBinding.svelte';

	function toggleEdition() {
		layout.editing = !layout.editing;
	}

	let components = [];

	function togglePreview() {
		if (!layout.previewing) {
			components = [...layout.components];
			layout.components = layout.components
				.filter((c) => c.root)
				.map((root) => {
					return {
						...root,
						children: [],
					};
				});
		} else {
			layout.components = components;
		}

		layout.previewing = !layout.previewing;
	}
</script>

<Root>
	{#if __BUILD__ || layout.previewing}
		<Build />
	{:else}
		<Row size={1}>
			<Column size={1.5}>
				<ModuleRenderer name="monitor" />
			</Column>
			<Column size={1}>
				<Row size={1}>
					<ModuleRenderer name="exports" />
				</Row>
				<Row size={1}>
					<ModuleRenderer name="params" />
				</Row>
			</Column>
		</Row>
	{/if}
</Root>
{#if !__BUILD__}
	<KeyBinding key="w" onTrigger={toggleEdition} />
	<KeyBinding key="p" onTrigger={togglePreview} />
{/if}
{#if layout.editing}
	<KeyBinding key="Escape" type="down" onTrigger={toggleEdition} />
{/if}
