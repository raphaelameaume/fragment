<script>
import { assignSketchFiles } from "../triggers/shared.js";
import { sketchesKeys } from "../stores/sketches.js";
import "../utils/glslErrors.js";

sketchesKeys.subscribe((keys) => {
	if (keys.length > 0) {
		assignSketchFiles(keys);
	}
})


</script>
