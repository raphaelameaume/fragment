import p5, { type Shader } from 'p5';

import type { Init, Rendering, Update } from '@fragment/types';
import { defineProps } from '@fragment/types/utils';

import fragmentShader from './fragment.fs';

export const props = defineProps({});

let shader: Shader;

export const setup: Init<'p5-webgl'> = ({ p }) => {
	shader = p.createShader(
		/* glsl */ `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vUv;

void main() {
    vUv = aTexCoord;

	vec3 transformed = (aPosition - 0.5) * 2.;

    gl_Position = vec4(transformed, 1.);
}
`,
		fragmentShader,
	);
};

export const draw: Update<'p5-webgl'> = ({ p, width, height, time }) => {
	p.shader(shader);

	shader.setUniform('uTime', time / 1000);

	p.rect(0, 0, width, height);
};

export const rendering: Rendering = 'p5-webgl';
