<Field prop={propInputWebcam} name={propInputWebcam.name} url="Webcam" />

<script>
import Field from "../Field.svelte";
import { Webcam } from "../../core/Webcam.js";

function enable() {
	Webcam.request({ audio: false, onSuccess: () => {
		// Webcam.canvas.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 999; max-width: 300px;';
		// document.body.appendChild(Webcam.canvas);
	}});
}

function disable() {
	Webcam.stop();
}

let propInputWebcam = {
	name: "webcam",
	type: "button",
	value: false,
	label: () => propInputWebcam.value ? 'Disable' : 'Enable',
	onChange: (prop) => {
		if (propInputWebcam.value) {
			enable();
		} else {
			disable();
		}
	},
	onTrigger: (prop) => {
		propInputWebcam.value = !propInputWebcam.value;
		propInputWebcam.label = propInputWebcam.value ? 'Disable' : 'Enable';
	}
};
</script>
