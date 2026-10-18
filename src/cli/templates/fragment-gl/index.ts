import { Uniforms } from 'fragment-gl';
import type { Init, Rendering, Update } from '@fragment/types';

import fragmentShader from './fragment.fs';

const uniforms = {
	uTime: { value: 0, type: 'float' },
} satisfies Uniforms;

export const init: Init<'fragment-gl'> = ({ frag }) => {
	frag.uniforms = uniforms;
	frag.shader = fragmentShader;
};

export const update: Update<'fragment-gl'> = ({ frag, deltaTime }) => {
	uniforms.uTime.value += deltaTime;

	frag.render();
};

export const rendering: Rendering = 'fragment-gl';
