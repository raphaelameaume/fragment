<script>
  import { afterUpdate, onMount } from "svelte";
import FieldGroup from "./FieldGroup.svelte";

export let folder;

let collapsed0 = folder.collapsed0;

$: collapsed = folder.collapsed;
$: name = folder.label;
$: nesting = folder.level;

// react to assign .collapsed to folder in code
onMount(() => {
	
	let unsub = folder.store.subscribe((value) => {
		collapsed = value;
	});

	return () => {
		unsub();
	}
})

afterUpdate(() => {
	// reinit collapsing if value change on init in sketch file
	if (folder.collapsed0 !== collapsed0) {
		collapsed = folder.collapsed0;
	}
});

</script>

<FieldGroup
	{name}
	{nesting}
	{collapsed}
>
	<slot></slot>
</FieldGroup>
