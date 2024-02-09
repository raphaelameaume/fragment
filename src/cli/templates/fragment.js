import fragmentShader from './fragment.fs';

let uniforms = {
	uTime: { value: 0, type: 'float' },
};

export let init = ({ frag }) => {
	frag.uniforms = uniforms;
	frag.shader = fragmentShader;
};

export let update = ({ frag, deltaTime }) => {
	uniforms.uTime.value += deltaTime;

	frag.render();
};

export let rendering = 'fragment';
