<script>
	import KeyBinding from '../components/KeyBinding.svelte';
	import Params from '../modules/Params.svelte';

	export let size = 0.3;
	export let align = 'right';
	export let output = false;
	export let hidden = false;

	$: visible = !hidden;
	$: width = typeof size === 'number' ? `${size * 100}%` : size;
</script>

<div
	class="container"
	class:hidden={!visible}
	class:align-left={align === 'left'}
	class:align-right={align === 'right'}
	style={`width: ${width};`}
>
	<Params {output} />
</div>
<KeyBinding key="h" on:trigger={() => (visible = !visible)} />

<style>
	.container {
		--padding: 16px;
		position: absolute;
		top: var(--padding);

		height: auto;

		border-radius: calc(var(--border-radius-input) * 2);
		overflow: hidden;
	}

	.container.hidden {
		display: none;
	}

	.container.align-left {
		left: var(--padding);
	}

	.container.align-right {
		right: var(--padding);
	}
</style>
