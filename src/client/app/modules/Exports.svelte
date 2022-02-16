<script context="module">
let instances = 0;
</script>

<script>
import Module from "../ui/Module.svelte";
import Field from "../ui/Field.svelte";
import FieldGroup from "../ui/FieldGroup.svelte";

let formats = [".mp4", ".gif"];

let record = () => {

};

</script>

<Module name="exports">
	<FieldGroup name="image">
		<Field key="format" value={"png"} params={{ options: ["png", "jpg", "webp"] }} />
		<Field key="quality" value={0.92} params={{ step: 0.01 }} />
	</FieldGroup>
	<FieldGroup name="video">
		<Field key="framerate" value={60} />
		<Field key="format" value={".mp4"} params={{ options: formats }} />
		<Field key="useDuration" value={true} />
		<Field key="record" value={record} params={{ label: "start" }} />
	</FieldGroup>
</Module>
