import Geometry from './Geometry.js';
import Texture from './Texture.js';
import Program from './Program';

class FBO {
	constructor(
		renderer,
		{
			name = '',
			vertex,
			fragment,
			uniforms,
			width = 512,
			height = 512,
			type,
			wrapS,
			wrapT,
			generateMipmaps = false,
			format,
			internalFormat,
			minFilter,
			magFilter,
		},
	) {
		this.gl = renderer.gl;
		this.renderer = renderer;

		this.width = width;
		this.height = height;

		this.geometry = new Geometry(this.gl, {
			position: { data: [-1, -1, 3, -1, -1, 3] },
		});

		this.program = new Program(this.gl, {
			vertex,
			fragment,
			uniforms,
		});

		this.texture = new Texture(this.gl, {
			name,
			width,
			height,
			type,
			wrapS,
			wrapT,
			generateMipmaps,
			format,
			internalFormat,
			minFilter,
			magFilter,
		});
		this.texture.update();

		this.framebuffer = this.gl.createFramebuffer();
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
		this.gl.framebufferTexture2D(
			this.gl.FRAMEBUFFER,
			this.gl.COLOR_ATTACHMENT0,
			this.gl.TEXTURE_2D,
			this.texture.glTexture,
			0,
		);
	}

	resize(width, height) {
		this.width = width;
		this.height = height;
		this.texture.resize(width, height);
	}

	render() {
		const viewport = this.gl.getParameter(this.gl.VIEWPORT);

		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
		this.gl.viewport(0, 0, this.width, this.height);
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.renderer.render({
			geometry: this.geometry,
			program: this.program,
		});

		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.viewport(...viewport);
	}

	destroy() {
		this.texture.destroy();
		this.gl.deleteFramebuffer(this.framebuffer);
		this.framebuffer = null;
	}
}

export default FBO;
