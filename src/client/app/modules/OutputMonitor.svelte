<script>
import { onMount } from "svelte";
import Monitor from "./Monitor.svelte";
import { current as currentRenderer } from "../stores/rendering.js";

export let grow;

</script>

<Monitor name="Output monitor" grow={grow} />

<style>

</style>
