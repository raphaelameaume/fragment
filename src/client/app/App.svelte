<script>
export let renderer;

console.log(renderer);

</script>

<div>
    <h1>Hello world</h1>
</div>

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

:global(body) {
    font-family: "Inter", serif;
}

:global(h1, h2, h3, h4, h5) {
    font-weight: 400;
}
</style>
