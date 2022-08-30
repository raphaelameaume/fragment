import { clearErrors, displayError } from "../stores/errors";
import { getContext } from "../triggers/shared";
import { getShaderPath, removeShaderPath } from "./glsl.utils";

const methods = ['attachShader'];

const contexts = [WebGLRenderingContext, WebGL2RenderingContext];
const references = {};

for (let i = 0; i < methods.length; i++) {
	const method = methods[i];
	references[method] = contexts.map((context) => context.prototype[method]);
}

function createUUID() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

function e(method, fn) {
	contexts.forEach(context => {
		const f = context.prototype[method];

		context.prototype[method] = function() {
			var res = f.apply( this, arguments );
			res = fn.apply( this, [ res, arguments ] ) || res;
			return res;
		}
	})
}

const FRAGMENT_SHADER = 35632;
const VERTEX_SHADER = 35633;

const programs = new Map();
const shaders = new Map();

class ShaderCompileError extends Error {

	constructor({
		source,
		filename = "",
		lineNumber,
		message = `Cannot compile ${filename !== "" ? filename : "shader"}`
	} = {}) {
		super(message, filename, lineNumber);

		this.name = "ShaderCompileError";
		this.source = source;
		this.lineNumber = lineNumber;

		this.stack = `at (${filename}:${lineNumber})`;
	}
}

e('createShader', function(res, args) {
	if (!this.__uuid) {
		this.__uuid = createUUID();
	}

	res.__uuid = createUUID();
	res.__type = args[0];
	
	shaders.set(res.__uuid, res);
});

e('attachShader', function(res, args) {
	const program = programs.get(args[0].__uuid);
	const shader = shaders.get(args[1].__uuid);

	if (shader.__type === FRAGMENT_SHADER) {
		program.__fragmentShader = shader; 
	} else if (shader.__type === VERTEX_SHADER) {
		program.__vertexShader = shader;
	}
});

e('shaderSource', function(res, args) {
	const shader = shaders.get(args[0].__uuid);
	const source = args[1];

	shader.__source = source;

	const filepath = getShaderPath(source);

	if (filepath) {
		const filename = filepath.replace(`${__CWD__}/`, "");

		shader.__filepath = filepath;
		shader.__filename = filename;

		clearErrors(shader.__filename);
	}
});

e('createProgram', function(res, args) {
	res.__uuid = createUUID();

	programs.set(res.__uuid, res);
});

e('compileShader', function(res, args) {
	const gl = this;
	const shader = args[0];

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const { source, filename, lineNumber, message } = getShaderError(gl, shader, shader.__type);
		const error = new ShaderCompileError({
			source,
			message,
			filename,
			lineNumber,
		});

		displayError(error, filename ? filename : this.__uuid);
	}
});

function getShaderError(gl, shader, type) {
	const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	const errors = gl.getShaderInfoLog(shader).trim();

	if (status && errors === '') return '';

	const errorMatches = errors.match(/ERROR: 0:(\d+):([\s\S]*$)/);
	
	if (errorMatches) {
		const lineNumber = parseInt(errorMatches[1]);
		const message = errorMatches[2];
		const shaderSource = gl.getShaderSource(shader);
		const source = handleSource(shaderSource, lineNumber);

		return {
			message, 
			source: source,
			lineNumber,
			filename: shader.__filename,
		};
	} else {
		return errors;
	}
}

function handleSource(source, errorLine) {
	const hasPath = getShaderPath(source);

	const lines = (hasPath ? removeShaderPath(source) : source).split('\n');
	const lines2 = [];

	const from = Math.max( errorLine - 6, 0 );
	const to = Math.min( errorLine + 6, lines.length );

	for ( let i = from; i < to; i ++ ) {
		const line = i + 1;

		lines2.push( `${line === errorLine ? '>' : ' '} ${line}: ${lines[ i ]}` );
	}

	return lines2.join( '\n' );
}
