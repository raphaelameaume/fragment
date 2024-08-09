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
	setContext('minimize', () => {
		current.minimized = !current.minimized;
	});
</script>

<div
	class="floating-params"
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
	.floating-params {
		--padding: 16px;
		position: absolute;
		top: var(--padding);

		height: auto;

		border-radius: calc(var(--border-radius-input) * 2);
		overflow: hidden;
	}

	.floating-params > :global(*) {
		height: calc(100vh - 2 * var(--padding));
	}

	.floating-params.minimized {
		height: 25px;
	}

	.floating-params.hidden {
		display: none;
	}

	.floating-params.align-left {
		left: var(--padding);
	}

	.floating-params.align-right {
		right: var(--padding);
	}
</style>
