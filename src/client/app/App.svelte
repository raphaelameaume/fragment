<script>
import { onMount, setContext, tick } from "svelte";
import { rendering } from "@fragment/props";
import Loading from "./ui/Loading.svelte";
import Layout from "./ui/Layout.svelte";
import TriggersSetup from "./ui/TriggersSetup.svelte";
import { current as currentRendering } from "./stores/rendering.js";
import { on, PREVIEW_AFTER_UPDATE, PREVIEW_BEFORE_UPDATE, PREVIEW_MOUNT, TRANSITION_CHANGE } from "./events";

let renderer;

async function loadRenderer() {
	if (rendering === "three-webgl") {
		return import("./renderers/THREERenderer.js");
	}

	return import("./renderers/2DRenderer.js");
};

async function start() {
	let canvas = document.createElement('canvas');
	renderer = await loadRenderer();
	let events = [
        { name: "onTransitionChange", event: TRANSITION_CHANGE },
        { name: "onMountPreview", event: PREVIEW_MOUNT },
        { name: "onBeforeUpdatePreview", event: PREVIEW_BEFORE_UPDATE },
        { name: "onAfterUpdatePreview", event: PREVIEW_AFTER_UPDATE },
    ];

    events.forEach(({ name, event }) => {
        if (typeof renderer[`${name}`] === "function") {
            on(event, (event) => {
				const { pixelRatio, width, height } = $currentRendering;

                renderer[`${name}`]({
					...event,
					width,
					height,
					pixelRatio,
				});
            });
        }
    });

	const { pixelRatio, width, height } = $currentRendering;

	const r = renderer.init({ canvas, pixelRatio, width, height });

	currentRendering.subscribe((current) => {
		renderer.resize({
			width: current.width,
			height: current.height,
			pixelRatio: current.pixelRatio,
			...r,
		});
	});

	currentRendering.update((rendering) => ({
			...rendering,
			renderer: r || {},
			canvas,
	}));

	await tick();
}

</script>

{#await start() }
	<Loading />
{:then}
	<TriggersSetup />
	<Layout {renderer}/>
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
	--borderColor: #0E0E0E;

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
