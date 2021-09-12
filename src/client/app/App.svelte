<script>
import Layout from "./ui/Layout.svelte";
export let renderer;

console.log(renderer);



</script>

<Layout />

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

:global(body) {
    position: relative;

    width: 100%;
    height: 100%;

    margin: 0;
    padding: 0;
    font-family: "Inter", serif;

    background-color: #242425;
    overscroll-behavior: none;
}

:global(button) {
    background-color: #202020;
    border: 1px solid #505050;
    -webkit-appearance: none;
    color: white;
    font-size: 10px;
    font-family: "Inter";
    /* font-weight: 600; */
    border-radius: 2px;
}

:global(#app) {
    display: flex;
    width: 100%;
    height: 100%;
}

:global(*) {
    box-sizing: border-box;
}

:global(h1, h2, h3, h4, h5) {
    font-weight: 400;
}
</style>
