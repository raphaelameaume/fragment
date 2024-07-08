<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { onKeyPress, onKeyDown, onKeyUp } from '../triggers';

	let { key, type = 'press', onTrigger = () => {} } = $props();

	const triggers = {
		press: onKeyPress,
		down: onKeyDown,
		up: onKeyUp,
	};

	const triggerType = triggers[type];

	let trigger;

	onMount(() => {
		trigger = triggerType(key, (event) => {
			onTrigger(event);
		});
	});

	onDestroy(() => {
		if (trigger) {
			trigger.destroy();
			trigger = null;
		}
	});
</script>
