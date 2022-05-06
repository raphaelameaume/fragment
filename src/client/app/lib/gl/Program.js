function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

let P_ID = 0;

class Program {

	constructor(gl, { vertex, fragment, uniforms = {} } = {}) {
		this.gl = gl;

		this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
		this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
		
		this._program = gl.createProgram();
		this.id = P_ID++;

		gl.attachShader(this._program, this.vertexShader);
		gl.attachShader(this._program, this.fragmentShader);
		gl.linkProgram(this._program);

		let programLog = gl.getProgramInfoLog(this._program);
		let vertexLog = gl.getShaderInfoLog(this.vertexShader);
		let fragmentLog = gl.getShaderInfoLog(this.fragmentShader);

		if (gl.getProgramParameter(this._program, gl.LINK_STATUS) === false) {
			console.error(`Program: shader error
			${vertexLog}
			${fragmentLog}
			`);
		} else if (programLog !== '') {
			console.warn(`lemonade-gl.Program: Program Info Log: ${programLog}`);
		}

		let success = gl.getProgramParameter(this._program, gl.LINK_STATUS);
		if (!success) {
			console.log(gl.getProgramInfoLog(this._program));
			gl.deleteProgram(this._program);
		}

		let uniformsLocations = Object.keys(uniforms).reduce((all, name) => {
			all[name] = gl.getUniformLocation(this._program, name);

			return all;
		}, {});

		let attributesCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
		let attributesLocations = {};

		for (let aIndex = 0; aIndex < attributesCount; aIndex++) {
			let attribute = gl.getActiveAttrib(this._program, aIndex);
			let location = gl.getAttribLocation(this._program, attribute.name);
			attributesLocations[attribute.name] = location;
		}

		this.uniforms = uniforms;
		this.attributesLocations = attributesLocations;
		this.uniformsLocations = uniformsLocations;
	}

	// set vertexShader(shader) {
	// 	this._vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, shader);
	// }

	// set fragmentShader(shader) {
	// 	this._fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, shader);
	// }

	// get vertexShader() {
	// 	return this._vertexShader;
	// }

	// get fragmentShader() {
	// 	return this._fragmentShader;
	// }
}

export default Program;
