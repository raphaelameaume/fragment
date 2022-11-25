<script>
import SketchFieldGroup from "./SketchFieldGroup.svelte";
import SketchField from "./SketchField.svelte";
import Tabs from "./Tabs.svelte";
import Tab from "./Tab.svelte";

export let children;
export let context;
export let props;
export let parent = null;

$: childrenOrdered = [...children]
	.filter(child => child.parent === parent)
	.sort((a, b) => a.order - b.order);
</script>

{#each childrenOrdered as child}
	{#if child.type === "folder"}
	<SketchFieldGroup folder={child}>
		{#if child.children.length > 0}
			<svelte:self
				children={child.children}
				{context}
				{props}
				parent={child}
			/>
		{/if}
		{#each Object.keys(props) as key, i}
			{#if (Array.isArray(props[key].folder) && props[key].folder.includes(child)) || (props[key].folder === child)}
				<SketchField
					{context}
					{key}
					{props}
				/>
			{/if}
		{/each}
	</SketchFieldGroup>
	{:else if child.type === "tabs"}
		<Tabs instance={child}>
			{#each child.children as tab, index (index)}
				<Tab label={tab.label} active={tab.active}>
					{#each Object.keys(props) as key, i}
						{#if (Array.isArray(props[key].tab) && props[key].tab.includes(tab)) || (props[key].tab === tab)}
							<SketchField
								{context}
								{key}
								{props}
							/>
						{/if}
					{/each}
					{#if tab.children.length > 0}
						<svelte:self
							children={tab.children}
							context={context}
							props={props}
							parent={tab}
						/>
					{/if}
				</Tab>
			{/each}
		</Tabs>
	{/if}
{/each}
{#if parent === null}
	{#each Object.keys(props) as key, i}
		{#if props[key].folder === undefined && props[key].tab === undefined}
			<SketchField
				{context}
				{key}
				{props}
			/>
		{/if}
	{/each}
{/if}
