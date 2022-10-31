<script>
import FieldGroup from "./FieldGroup.svelte";
import SketchField from "./SketchField.svelte";
import Tabs from "./Tabs.svelte";
import Tab from "./Tab.svelte";

export let children;
export let context;
export let props;
export let parent = null;

$: childrenOrdered = [...children]
	.filter(child => child.parent === parent)
	.sort((a, b) => a.params.order - b.params.order);
</script>

{#each childrenOrdered as child}
	{#if child.type === "folder"}
	<FieldGroup name={child.label} nesting={child.level} collapsed={child.collapsed}>
		{#if child.children.length > 0}
			<svelte:self
				children={child.children}
				context={context}
				props={props}
				parent={child.id}
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
	</FieldGroup>
	{:else if child.type === "tabs"}
		<Tabs>
			{#each child.children as tab}
				<Tab label={tab.label} key={`${tab.id}${tab.label}`}>
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
						<svelte:self children={tab.children} context={context} props={props} parent={tab.id} />
					{/if}
				</Tab>
			{/each}
		</Tabs>
	{/if}
{/each}
