import { fragment } from "../lib/gl";
import { client } from "@fragment/client";

let frags = [];

export let onMountPreview = ({ canvas, index }) => {
	let frag = fragment({
		canvas,
	});

	frags.push({
		index,
		frag,
	});

	return { frag };
};

export let onResizePreview = ({ index, width, height, pixelRatio }) => {
	let { frag } = frags.find(f => f.index === index);

	frag.resize({ width, height, pixelRatio });
};

export let onDestroyPreview = ({ canvas, index }) => {
	let fragIndex = frags.findIndex(f => f.index === index);
	let { frag } = frags[fragIndex];

	frag.destroy();
	frags.splice(fragIndex, 1);
};

client.on('shader-update', (data) => {
	const { filepath, source } = data;

	const getShaderPath = (shader) => {
        const match = shader.match(/<filepath:\/\/(.*)>/);
		return match && match[1];
    };

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
				console.log(`[fragment] HotShaderReload : ${shaderPath.replace(__CWD__, "")}`);
				program[key] = source;
				program.needsUpdate = true;
			}
		});
	});
});
