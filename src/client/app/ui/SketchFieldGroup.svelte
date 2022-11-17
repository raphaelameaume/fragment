<script>
  import { afterUpdate, onMount } from "svelte";
import FieldGroup from "./FieldGroup.svelte";

export let folder;

$: attributes = folder.attributes;
$: collapsed = $attributes.collapsed;
$: name = folder.label;
$: nesting = folder.level;

</script>

<FieldGroup
	{name}
	{nesting}
	{collapsed}
>
	<slot></slot>
</FieldGroup>
