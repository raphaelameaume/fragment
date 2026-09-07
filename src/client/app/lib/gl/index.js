import Geometry from './Geometry.js';
import Texture from './Texture.js';
import Program, { defaultFragment, defaultVertex } from './Program.js';
import Renderer from './Renderer.js';
import FBO from './FBO.js';

export { Geometry, Texture, Program, Renderer, FBO };

/**
 * @typedef {Object} Frag
 * @property {WebGLRenderingContext|WebGL2RenderingContext|null} gl
 * @property {Program} program
 * @property {() => Texture} texture
 * @property {(params: { width: number, height: number, pixelRatio: number }) => void} resize
 * @property {() => void} render
 * @property {() => void} destroy
 */

/**
 *
 * @param {object} params
 * @param {HTMLCanvasElement} [params.canvas]
 * @param {string} [params.shader]
 * @param {Record<any, any>} [params.uniforms]
 * @returns {Frag}
 */
export function fragment({
	canvas = document.createElement('canvas'),
	shader = defaultFragment,
	uniforms = {},
} = {}) {
	let _fragmentShader = shader;
	let _vertexShader = defaultVertex;
	let _uniforms = uniforms;

	let renderer = new Renderer({
		canvas,
	});

	let geometry = new Geometry(renderer.gl);
	let program = new Program(renderer.gl, {
		fragment: shader,
		uniforms,
	});

	function render() {
		renderer.render({ geometry, program });
	}

	let w, h, pr;

	function resize({ width = w, height = h, pixelRatio = pr } = {}) {
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize({ width, height });

		w = width;
		h = height;
		pr = pixelRatio;
	}

	function destroy() {
		geometry.destroy();
		renderer.destroy();
		uniforms = {};
	}

	/** @type {Frag} */
	const frag = {
		gl: renderer.gl,
		renderer,
		program,

		texture: (params = {}) => new Texture(gl, params),

		resize,
		render,
		destroy,
	};

	Object.defineProperty(frag, 'shader', {
		enumerable: true,
		configurable: true,
		get: () => {
			return _fragmentShader;
		},
		set: (v) => {
			_fragmentShader = v;
			program.fragmentShader = _fragmentShader;
		},
	});

	Object.defineProperty(frag, 'fragmentShader', {
		enumerable: true,
		configurable: true,
		get: () => {
			return _fragmentShader;
		},
		set: (v) => {
			_fragmentShader = v;
			program.fragmentShader = _fragmentShader;
		},
	});

	Object.defineProperty(frag, 'vertexShader', {
		enumerable: true,
		configurable: true,
		get: () => {
			return _vertexShader;
		},
		set: (v) => {
			_vertexShader = v;
			program.vertexShader = _vertexShader;
		},
	});

	Object.defineProperty(frag, 'uniforms', {
		enumerable: true,
		configurable: true,
		get: () => {
			return _uniforms;
		},
		set: (v) => {
			_uniforms = v;
			program.uniforms = _uniforms;
			program.needsUpdate = true;
		},
	});

	return frag;
}
