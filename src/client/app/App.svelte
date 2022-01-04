<script>
import { tick } from "svelte";
import { rendering } from "@fragment/props";
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

<style>
@font-face {
	font-family: 'Inter';
	font-style: normal;
	font-weight: 400;
	font-display: swap;
	src: url("/fonts/Inter-Regular.woff2?v=3.19") format("woff2");
}

@font-face {
	font-family: 'Inter';
	font-style: italic;
	font-weight: 400;
	font-display: swap;
	src: url("/fonts/Inter-Italic.woff2?v=3.19") format("woff2");
}

@font-face {
	font-family: 'Inter';
	font-style: normal;
	font-weight: 600;
	font-display: swap;
	src: url("/fonts/Inter-SemiBold.woff2?v=3.19") format("woff2");
}

@font-face {
	font-family: 'Inter';
	font-style:  normal;
	font-weight: 700;
	font-display: swap;
	src: url("/fonts/Inter-Bold.woff2?v=3.19") format("woff2");
}

:global(html) {
	height: 100%;
}

:global(:root) {
	--fontFamily: "Jetbrains Mono", system-ui, sans-serif;
	--backgroundColor: #242425;
	--activeColor: #177bd0;
	--topBarHeight: 24px;
	--color-lightblack: #0E0E0E;
	--borderColor: var(--color-lightblack);

    --inputColor: #f0f0f0;
	--inputHeight: 20px;
    --inputBorderRadius: 3px;
    --inputBorderWidth: 1px;
    --inputBorderColor: #000000;
    --inputBackgroundColor: #1d1d1e;
    --spacingColor: #323233;
    --inputFontSize: 11px;
    --inputFontFamily: "Jetbrains Mono";
}

:global(body) {
	position: fixed;

	width: 100%;
	height: 100%;

	margin: 0;
	padding: 0;
	font-family: var(--fontFamily);

	background-color: var(--backgroundColor);
	overscroll-behavior: none;
}

:global(button) {
	background-color: #202020;
	border: 1px solid #505050;
	-webkit-appearance: none;
	color: inherit;
	font-size: 10px;
	font-family: "Inter";
	/* font-weight: 600; */
	border-radius: 2px;
}

:global(#app) {
	display: flex;
	width: 100%;
	height: 100%;
	flex-direction: column;
	overflow: hidden;
}


:global(ul, ol) {
	list-style: none;
	margin: 0;
	padding: 0;
}

:global(*) {
	box-sizing: border-box;
}

:global(input, select, button) {
	-webkit-appearance: none;
	padding: 0;
	margin: 0;
	border: none;
	font-family: var(--fontFamily);
}

:global(h1, h2, h3, h4, h5) {
	font-weight: 400;
	margin: 0;
	padding: 0;
}
</style>
