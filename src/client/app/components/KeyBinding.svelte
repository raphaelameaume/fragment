<script>
import { createEventDispatcher, onDestroy, onMount } from "svelte";
import { onKeyPress, onKeyDown, onKeyUp } from "../triggers";

export let key;
export let type = "press";

const dispatch = createEventDispatcher();

const triggers = {
	"press": onKeyPress,
	"down": onKeyDown,
	"up": onKeyUp,
};

const triggerType = triggers[type];

let trigger;

onMount(() => {
	trigger = triggerType(key, (event) => {
		dispatch('trigger', event);
	});
})

onDestroy(() => {
	if (trigger) {
		trigger.destroy();
		trigger = null;
	}
});
</script>
