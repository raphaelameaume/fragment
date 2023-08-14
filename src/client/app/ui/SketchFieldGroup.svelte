<script>
	import FieldGroup from './FieldGroup.svelte';

	export let folder;

	$: attributes = folder.attributes;
	$: collapsed = $attributes.collapsed;
	$: name = $attributes.label;
	$: nesting = folder.level;
</script>

<FieldGroup {name} {nesting} {collapsed}>
	<slot />
</FieldGroup>
