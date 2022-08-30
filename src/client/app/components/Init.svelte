<script>
import { assignSketchFiles } from "../triggers/shared.js";
import { names as sketchFiles } from "../stores/sketches.js";
import "../utils/glslErrors.js";

assignSketchFiles(sketchFiles);

window.onunhandledrejection = (e) => {
	console.log("onunhandledrejection");
	console.log(e);
};

window.onerror = (e) => {
	console.log("onError");
	console.log(e);
}

</script>
