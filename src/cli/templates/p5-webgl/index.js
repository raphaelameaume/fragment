import p5 from 'p5';
import fragmentShader from './fragment.fs';

export let props = {
	backgroundColor: {
		value: [0, 0, 255],
		type: 'color',
	},
};

let shader;

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {p5} params.p
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let setup = ({ p, width, height }) => {
	shader = p.createShader(
		/* glsl */ `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vUv;

void main() {
    vUv = aTexCoord;

	vec3 transformed = aPosition;
    transformed.xy = transformed.xy - 1.;
    
    gl_Position = vec4(transformed, 1.);
}
`,
		fragmentShader,
	);
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {p5} params.p
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @param {number} params.time
 * @param {number} params.deltaTime
 * @param {number} params.frame
 * @param {number} params.playhead
 * @param {number} params.playcount
 */
export function draw({ p, width, height, time }) {
	p.background(255, 120, 0);

	p.shader(shader);

	shader.setUniform('uTime', time / 1000);

	p.rect(0, 0, width, height);
}

export let rendering = 'p5-webgl';
