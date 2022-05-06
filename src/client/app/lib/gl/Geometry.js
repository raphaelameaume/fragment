class Geometry {
	constructor(gl, {
		attributes = {
            position: { data: [-1, -1, 3, -1, -1, 3] },
            uv: { data: [0, 0, 2, 0, 0, 2] }
        }
	} = {}) {
		this.gl = gl;
		this.attributes = attributes;
		this.buffers = Object.keys(attributes).reduce((all, name) => {
			let buffer = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(attributes[name].data),
				gl.STATIC_DRAW
			);

			all[name] = buffer;

			return all;
		}, {});
	}

	destroy() {
		Object.keys(this.buffers).forEach(name => {
			let buffer = this.buffers[name];
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, 1, this.gl.STATIC_DRAW);
			this.gl.deleteBuffer(buffer);
		});

		this.buffers = null;
		this.attributes = null;
	}
}

export default Geometry;
