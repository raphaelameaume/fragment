import { fragment } from "../lib/gl";
import { client } from "@fragment/client";
import { getShaderPath } from "../utils/glsl.utils";
import { clearError } from "../stores/errors";

let frags = [];

export let onMountPreview = ({ canvas, id }) => {
	let frag = fragment({
		canvas,
	});

	frags.push({
		id,
		frag,
	});

	return { frag };
};

export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	let { frag } = frags.find(f => f.id === id);

	frag.resize({ width, height, pixelRatio });
};

export let onDestroyPreview = ({ canvas, id }) => {
	let fragIndex = frags.findIndex(f => f.id === id);
	let { frag } = frags[fragIndex];
	
	clearError(frag.gl.__uuid);

	frag.destroy();
	frags.splice(fragIndex, 1);
};

client.on('shader-update', (data) => {
	frags.forEach(({ frag }) => clearError(frag.gl.__uuid));

	const { filepath, source } = data;

	const programs = frags.map(({ frag }) => frag.program);

	programs.forEach((program) => {
		const { fragment, vertex } = program;

		const shaders = {
			vertexShader: vertex,
			fragmentShader: fragment
		};

		Object.keys(shaders).forEach((key) => {
			const shaderPath = getShaderPath(shaders[key]);

			if (shaderPath === filepath) {
				console.log(`[fragment] shader update ${shaderPath.replace(__CWD__, "")}`);
				program[key] = source;
				program.needsUpdate = true;
			}
		});
	});
});
