<script>
import { onDestroy } from "svelte";

import { rendering } from "../stores/rendering";
import Build from "./Build.svelte";

let saved = $rendering;

onDestroy(() => {
	$rendering = saved;
});

</script>

<Build />
