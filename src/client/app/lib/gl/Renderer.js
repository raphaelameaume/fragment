class Renderer {

	constructor({
		canvas = document.createElement('canvas'),
		antialias = false,
		alpha = true,
		depth = false,
		stencil = false,
		premultipliedAlpha = false,
		pixelRatio = window.devicePixelRatio,
		webgl = 2,
	}) {
		let attributes = {
			depth,
			stencil,
			antialias,
			alpha,
			premultipliedAlpha,
			preserveDrawingBuffer: true
		};

		this.canvas = canvas;

		if (webgl === 2) gl = canvas.getContext('webgl2', attributes);
		if (!gl) {
			this.gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
		}

		this.state = {
			activeTextureUnit: 0,
			textureUnits: [],
			flipY: false,
			viewport: { width: 0, height: 0 },
			pixelRatio,
			width: 0,
			height: 0,
		};
		this.gl.state = this.state;
	}

    render({
        geometry,
        program,
        primitiveType = this.gl.TRIANGLES,
        offset = 0,
        count = 3
    }) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(program.program);

        for (let attributeName in program.attributesLocations) {
            let location = program.attributesLocations[attributeName];
            let buffer = geometry.buffers[attributeName];

            this.gl.enableVertexAttribArray(location);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

            const size = 2; // 2 components per iteration
            const type = this.gl.FLOAT; // the data is 32bit floats
            const normalize = false; // don't normalize the data
            const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
            const bufferOffset = 0; // start at the beginning of the buffer
            this.gl.vertexAttribPointer(
                location,
                size,
                type,
                normalize,
                stride,
                bufferOffset
            );
        }

        let textureUnit = -1;

        for (let uniformName in program.uniforms) {
            let location = program.uniformsLocations[uniformName];
            if (location) {
                let uniform = program.uniforms[uniformName];

                if (uniform.type === 'float') {
                    this.gl.uniform1f(location, uniform.value);
                } else if (uniform.type === 'vec2') {
                    this.gl.uniform2f(location, uniform.value[0], uniform.value[1]);
                } else if (uniform.type === 'vec3') {
                    this.gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
                } else if (uniform.type === 'vec4') {
                    this.gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
                } else if (uniform.type === 'sampler2D') {
                    if (uniform.value) {
                        textureUnit = textureUnit + 1;
                        uniform.value.update(textureUnit);
    
                        this.gl.uniform1i(location, textureUnit);
                    }
                }
            }
        }

        this.gl.drawArrays(primitiveType, offset, count);
    }

    setPixelRatio(pixelRatio = this.state.pixelRatio) {
        if (this.state.pixelRatio !== pixelRatio) {
            this.state.pixelRatio = pixelRatio;
        	this.setSize();
        }
    }

    setSize({ width = this.state.width, height = this.state.height } = {}) {
        this.state.width = width;
        this.state.height = height;

        this.canvas.width = this.state.width * this.state.pixelRatio;
        this.canvas.height = this.state.height * this.state.pixelRatio;

        this.setViewport();
    }

    setViewport({ width = this.state.width, height = this.state.height } = {}) {
        let w = Math.floor(width * this.state.pixelRatio);
        let h = Math.floor(height * this.state.pixelRatio);

        if (this.state.viewport.width !== w || this.state.viewport.height !== h) {
            this.gl.viewport(0, 0, w, h);

            this.state.viewport.width = w;
            this.state.viewport.height = h;
        }
    }

    destroy() {
        let extension = this.gl.getExtension('WEBGL_lose_context');

        if (extension) {
            extension.loseContext();
        }
    }
}

export default Renderer;
