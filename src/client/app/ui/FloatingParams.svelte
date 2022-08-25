<script>
import Params from "../modules/Params.svelte";

export let size = 0.3;
export let align = "right";
export let output = false;

$: width = typeof size === "number" ? `${size * 100}%` : size;

</script>

<div class="container" style={`width: ${width};`} class:align-left={align === "left"} class:align-right={align === "right"}>
	<Params {output}/>
</div>

<style>
.container {
	--padding: 16px;
	position: absolute;
	top: var(--padding);

	height: auto;

	border-radius: calc(var(--border-radius-input) * 2);
	overflow: hidden;
}

.container.align-left {
	left: var(--padding);
}

.container.align-right {
	right: var(--padding);
}
</style>
