function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    
    if (success) {
        return shader;
    }

	console.warn(`lemonade-gl.Program: Shader Info Log: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
}

let P_ID = 0;

let defaultVertex = /* glsl */`
    attribute vec4 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main(){
        vUv = uv;
        gl_Position = position;
    }
`;

let defaultFragment = /* glsl */`
    precision highp float;

    varying vec2 vUv;

    void main() {
        gl_FragColor = vec4(vec3(0., 1., 0.), 1.);
    }
`;

class Program {

	constructor(gl, { vertex = defaultVertex, fragment = defaultFragment, uniforms = {} } = {}) {
		this.gl = gl;

		this.vertexShader = vertex;
		this.fragmentShader = fragment;
		this.uniforms = uniforms;
		this.needsUpdate = true;
		
		this._program = gl.createProgram();
		this.id = P_ID++;

		this.compile();
	}

	set vertexShader(text) {
		this._vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, text);
		this.needsUpdate = true;
	}

	get vertexShader() {
		return this._vertexShader;
	}

	set fragmentShader(text) {
		// if (this._fragmentShader) {
		// 	this.gl.deleteShader(this._fragmentShader);
		// }

		this._fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, text);
		this.needsUpdate = true;
	}

	get fragmentShader() {
		return this._fragmentShader;
	}

	compile() {
		const { gl, _program, uniforms } = this;

		gl.attachShader(_program, this.vertexShader);
		gl.attachShader(_program, this.fragmentShader);
		gl.linkProgram(_program);

		let programLog = gl.getProgramInfoLog(_program);
		let vertexLog = gl.getShaderInfoLog(this.vertexShader);
		let fragmentLog = gl.getShaderInfoLog(this.fragmentShader);

		if (gl.getProgramParameter(_program, gl.LINK_STATUS) === false) {
			console.error(`Program: shader error
			${vertexLog}
			${fragmentLog}
			`);
		} else if (programLog !== '') {
			console.warn(`lemonade-gl.Program: Program Info Log: ${programLog}`);
		}

		let success = gl.getProgramParameter(_program, gl.LINK_STATUS);
		if (!success) {
			console.warn(`lemonade-gl.Program: Program Info Log: ${gl.getProgramInfoLog(_program)}`);
			gl.deleteProgram(_program);
		}

		let uniformsLocations = Object.keys(uniforms).reduce((all, name) => {
			all[name] = gl.getUniformLocation(_program, name);

			return all;
		}, {});

		let attributesCount = gl.getProgramParameter(_program, gl.ACTIVE_ATTRIBUTES);
		let attributesLocations = {};

		for (let aIndex = 0; aIndex < attributesCount; aIndex++) {
			let attribute = gl.getActiveAttrib(_program, aIndex);
			let location = gl.getAttribLocation(_program, attribute.name);
			attributesLocations[attribute.name] = location;
		}

		this.gl.detachShader(_program, this._vertexShader);
		this.gl.detachShader(_program, this._fragmentShader);

		this.attributesLocations = attributesLocations;
		this.uniformsLocations = uniformsLocations;

		this.needsUpdate = false;
	}
}

export default Program;
