<script>
import { tree } from "../stores/layout";
import LayoutComponent from "./LayoutComponent.svelte";

$: type = $tree.type;
$: size = $tree.size;
</script>

<LayoutComponent tree={$tree} type={type} size={size}>
	<slot></slot>
</LayoutComponent>
