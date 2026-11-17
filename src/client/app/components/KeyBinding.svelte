<script>
	import { onDestroy } from 'svelte';
	import { onKeyDown, onKeyUp } from '../triggers/Keyboard.js';

	/**
	 * @typedef {Object} Props
	 * @property {string} key
	 * @property {'down'|'up'} [type]
	 * @property {import('../triggers/Keyboard.js').KeyboardTriggerCallback} onTrigger
	 */

	/** @type {Props} */
	let { key, type = 'down', onTrigger } = $props();

	const triggers = {
		down: onKeyDown,
		up: onKeyUp,
	};

	const triggerType = $derived(triggers[type]);

	/** @type {import('../triggers/Trigger.js').Trigger | undefined} */
	let trigger;

	$effect(() => {
		if (trigger) {
			trigger.dispose();
			trigger = undefined;
		}

		if (triggerType) {
			trigger = triggerType(key, (event) => {
				onTrigger(event);
			});
		} else {
			console.error(`Keybinding with type ${type} is not supported.`);
		}
	});

	onDestroy(() => {
		if (trigger) {
			trigger.dispose();
			trigger = undefined;
		}
	});
</script>
