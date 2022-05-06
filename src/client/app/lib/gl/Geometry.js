class Geometry {
	constructor(gl, {
		attributes = {
            position: { data: [-1, -1, 3, -1, -1, 3] },
            uv: { data: [0, 0, 2, 0, 0, 2] }
        }
	} = {}) {
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
}

export default Geometry;
