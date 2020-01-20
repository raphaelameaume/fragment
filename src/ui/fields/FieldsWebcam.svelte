<Field prop={propInputWebcam} name={propInputWebcam.name} />

<script>
import Field from "../Field.svelte";
import { Webcam } from "../../core/Webcam.js";

let propInputWebcam = {
	name: "webcam",
	type: "button",
	label: "Enable",
	enabled: false,
	onTrigger: (prop) => {
		propInputWebcam.enabled = !propInputWebcam.enabled;
		propInputWebcam.label = propInputWebcam.enabled ? 'Disable' : 'Enable';

		if (propInputWebcam.enabled) {
			Webcam.request({ audio: false, onSuccess: () => {
				Webcam.video.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 999; max-width: 300px;';
	
				document.body.appendChild(Webcam.video);
			}});
		} else {
			Webcam.stop();
		}
	}
};
</script>
