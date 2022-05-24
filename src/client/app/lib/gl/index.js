import Geometry from "./Geometry.js";
import Texture from "./Texture.js";
import Program from "./Program.js";
import Renderer from "./Renderer.js";

export { Geometry, Texture, Program, Renderer };

export function fragment({
	canvas = document.createElement('canvas'),
	shader,
	uniforms = {},
}) {
	let _shader = shader;
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

	function resize({ width = w, height = h, pixelRatio = pr }) {
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize({ width, height });

		w = width;
		h = height;
		pr = pixelRatio;
	}

	function destroy() {
		geometry.destroy();
		renderer.destroy();
		uniforms = null;
	}

	const frag = {
		gl: renderer.gl,
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
			return _shader;
		},
		set: (v) => {
			_shader = v;
			program.fragmentShader = _shader;
		}
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
		}
	});

	return frag;
}
