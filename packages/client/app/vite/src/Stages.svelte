<script>
import Stage from "./Stage.svelte";

import { scenes } from "@fragment/scenes";

export let indexFirst;
export let indexSecond;
export let renderer;

</script>

<Stage renderer={renderer} scene={scenes[indexFirst]}></Stage>
<Stage renderer={renderer} scene={scenes[indexSecond]}></Stage>
