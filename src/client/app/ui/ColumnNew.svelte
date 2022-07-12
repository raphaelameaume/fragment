<script>
import LayoutComponent from "./LayoutComponent.svelte";

export let size = 1;
</script>

<LayoutComponent size={size} type="column">
	<slot></slot>
</LayoutComponent>
