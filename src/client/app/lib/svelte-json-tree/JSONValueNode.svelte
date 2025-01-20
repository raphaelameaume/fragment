<script>
	let { value, nodeType } = $props();
</script>

<span class={nodeType}>
	{value}
</span>

<style>
	.Date {
		color: var(--date-color);
	}
	.BigInt {
		color: var(--number-color);
	}
	.Number {
		color: var(--number-color);
	}
	.Boolean {
		color: var(--boolean-color);
	}
	.Null {
		color: var(--null-color);
	}
	.Undefined {
		color: var(--undefined-color);
	}
	.Symbol {
		color: var(--symbol-color);
	}
</style>
