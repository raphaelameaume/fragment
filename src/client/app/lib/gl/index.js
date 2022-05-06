import Geometry from "./Geometry.js";
import Texture from "./Texture.js";
import Program from "./Program.js";
import Renderer from "./Renderer.js";

export { Geometry, Texture, Program, Renderer };

export function fragment({
	canvas,
	shader,
	uniforms = {},
}) {
	const renderer = new Renderer({
		canvas,
	});

	const geometry = new Geometry(renderer.gl);
	const program = new Program(renderer.gl, {
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

	return {
		gl: renderer.gl,
		uniforms,

		resize,
		render,
		destroy,
	};
}
