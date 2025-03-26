import { Init, Rendering, Update } from '@fragment/types';

import fragmentShader from './fragment.fs';

const uniforms = {
	uTime: { value: 0, type: 'float' }
};

export const init: Init<'fragment'> = ({ frag }) => {
	frag.uniforms = uniforms;
	frag.shader = fragmentShader;
};

export const update: Update<'fragment'> = ({ frag, deltaTime }) => {
	uniforms.uTime.value += deltaTime;

	frag.render();
};

export const rendering: Rendering = 'fragment';
