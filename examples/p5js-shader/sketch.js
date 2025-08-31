import p5 from 'p5';
import fragmentShader from './sketch.fs';

const zoom = [1, 10];

export let props = {
	speed: {
		value: 0.5,
		params: {
			min: 0,
			max: 1,
			step: 0.01,
		},
	},
	zoom: {
		value: zoom,
		params: {
			min: 0,
			max: 20,
			step: 1,
		},
		onChange: ({ value }) => {
			console.log(zoom, value, zoom === value);
		},
	},
};

let shader;
let time = 0;

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {p5} params.p
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export function setup({ p, width, height }) {
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
    transformed.xy = transformed.xy - 0.5;
    transformed.xy *= 2.;

    gl_Position = vec4(transformed, 1.);
}
`,
		fragmentShader,
	);
}

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
export function draw({ p, width, height, deltaTime }) {
	p.shader(shader);

	time += deltaTime * props.speed.value;

	shader.setUniform('uTime', time / 1000);
	shader.setUniform('uZoomScaleMin', props.zoom.value[0]);
	shader.setUniform('uZoomScaleMax', props.zoom.value[1]);

	p.rect(0, 0, width, height);
}

export let rendering = 'p5-webgl';
