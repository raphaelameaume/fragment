<script>
import { assignSketchFiles } from "../triggers/shared.js";
import { names as sketchFiles } from "../stores/sketches.js";
import "../utils/glslErrors.js";
import { displayError } from "../stores/errors.js";

assignSketchFiles(sketchFiles);

</script>
