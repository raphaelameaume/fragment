<script>
import { onMount, tick } from "svelte";
import Loading from "./ui/Loading.svelte";
import Layout from "./ui/Layout.svelte";
import TriggersSetup from "./ui/TriggersSetup.svelte";
import { current as currentRendering } from "./stores/rendering.js";

export let rendering;

async function loadRenderer(renderer) {
    return import("./renderers/2DRenderer.js");
};

async function start() {
    const { init, resize, update, render } = await loadRenderer(rendering);

    init($currentRendering);
    resize($currentRendering);

    const { renderer, canvas } = await loadRenderer();

    currentRendering.update((rendering) => ({
        ...rendering,
        renderer,
        canvas,
    }));

    await tick();

    currentRendering.subscribe(({ width, height }) => {
        resize($currentRendering);
    });
}

</script>

{#await start() }
    <Loading />
{:then}
    <TriggersSetup />
    <Layout />
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
    --fontFamily: "Inter", system-ui, sans-serif;
    --backgroundColor: #242425;
    --activeColor: #177bd0;
    --topBarHeight: 24px;
}

:global(body) {
    position: relative;

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
