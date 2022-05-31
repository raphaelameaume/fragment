import fragmentShader from "./icon.fs";


export let props = {
	radius: {
		value: 0.1,
		params: {
			min: 0,
			max: 0.5,
			step: 0.01,
		}
	}
};

let uniforms = {
	uTime: { value: 0, type: "float" },
	uRadius: { value: props.radius.value, type: "float" },
};

export let fps = 0;

export let init = ({ frag }) => {
	frag.uniforms = uniforms;
	frag.shader = fragmentShader;
	frag.vertexShader = `#version 300 es
in vec4 position;
in vec2 uv;

out vec2 vUv;

void main(){
	vUv = uv;
	gl_Position = position;
}
`;
};

export let update = ({ frag, deltaTime }) => {
	uniforms.uTime.value += deltaTime;
	uniforms.uRadius.value = props.radius.value;

	frag.render();
};

export let rendering = "fragment";
