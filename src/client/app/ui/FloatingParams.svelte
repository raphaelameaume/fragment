<script>
	import KeyBinding from '../components/KeyBinding.svelte';
	import Params from '../modules/Params.svelte';
	import { setContext } from 'svelte';

	let {
		size = '340px',
		align = 'right',
		output = false,
		hidden = false,
		minimize = false,
	} = $props();

	let visible = $state(!hidden);
	let width = $derived(typeof size === 'number' ? `${size * 100}%` : size);
	let current = $state({
		minimized: minimize,
	});

	let minimizedSave = minimize;
	let minimizedProp = $derived(minimize);
	let minimized = $derived(current.minimized);

	$effect(() => {
		// override current.minimized state if prop changes
		if (minimizedProp !== minimizedSave) {
			current.minimized = minimizedProp;
			minimizedSave = minimizedProp;
		}
	});

	setContext('parent', current);
</script>

<div
	class="container"
	class:hidden={!visible}
	class:align-left={align === 'left'}
	class:align-right={align === 'right'}
	class:minimized
	style={`width: ${width};`}
>
	<Params {output} />
</div>
<KeyBinding key="h" onTrigger={() => (visible = !visible)} />

<style>
	.container {
		--padding: 16px;
		position: absolute;
		top: var(--padding);

		height: auto;

		border-radius: calc(var(--border-radius-input) * 2);
		overflow: hidden;
	}

	.container.minimized {
		height: 25px;
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
