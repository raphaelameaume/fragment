<script>
import FieldGroup from "../ui/FieldGroup.svelte";
import { folders } from "../stores/folders";
  import SketchProp from "./SketchProp.svelte";
  import Tabs from "./Tabs.svelte";

export let children = $folders;
export let context;
export let props;

</script>

{#each children as folder}
	<FieldGroup name={folder.label} nesting={folder.level}>
		<Tabs />
		{#if folder.children.length > 0}
			<svelte:self children={folder.children} context={context} props={props} />
		{/if}
		{#each Object.keys(props) as key, i}
			{#if (Array.isArray(props[key].folder) && props[key].folder.includes(folder)) || (props[key].folder === folder)}
				<SketchProp
					{context}
					{key}
					{props}
				/>
			{/if}
		{/each}
	</FieldGroup>
{/each}
