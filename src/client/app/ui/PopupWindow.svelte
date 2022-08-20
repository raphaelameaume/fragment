<script>
import { onDestroy, onMount } from "svelte";
import { rendering } from "../stores/rendering";

export let width = 512;
export let height = 512;

let modal;
onMount(() => {
	const options = {
		width: $rendering.width,
		height: $rendering.height,
		toolbar: 'no',
		scrollbars: 'no',
		location: 'no',
		menubar: 'no',
		status: 'no',
	};

	const url = `${window.location.origin}/?stream`;

	modal = window.open(url, `[stream] fragment`, Object.keys(options).map((key) => {
		return `${key}=${options[key]}`;
	}).join(','));
});

onDestroy(() => {
});

</script>
