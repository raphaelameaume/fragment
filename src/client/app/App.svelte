<script>
import { tick } from "svelte";
import Loading from "./ui/Loading.svelte";
import Layout from "./ui/Layout.svelte";
import TriggersSetup from "./ui/TriggersSetup.svelte";
import "./client";
import Clone from "./ui/Clone.svelte";

async function start() {
	await tick();
}

</script>

{#await start() }
	<Loading />
{:then}
	<TriggersSetup />
	{#if window.location.search.includes("clone")}
		<Clone />
	{:else}
	<Layout />
	{/if}
{/await}
