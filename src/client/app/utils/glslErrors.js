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

e('createShader', function(res, args) {
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
});

e('createProgram', function(res, args) {
	res.__uuid = createUUID();

	programs.set(res.__uuid, res);
});

// e('linkProgram', function(res, args) {
// 	const gl = this;
// 	const program = args[0];

// 	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
// 		const vertexErrors = getShaderErrors(gl, program.__vertexShader, VERTEX_SHADER);
// 		const fragmentErrors = getShaderErrors(gl, program.__fragmentShader, FRAGMENT_SHADER);

// 		console.log(vertexErrors);
// 		console.log(fragmentErrors);

// 		// console.log({ vertexErrors, fragmentErrors });

// 		// throw new Error(`Could not compile WebGL program. \n\n${info}`);
// 	}
// });

e('compileShader', function(res, args) {
	const gl = this;
	const shader = args[0];

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const errors = getShaderErrors(gl, shader, shader.__type);

		console.log(errors);
	}
});

function getShaderErrors(gl, shader, type) {
	const status = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
	const errors = gl.getShaderInfoLog( shader ).trim();

	if ( status && errors === '' ) return '';

	const errorMatches = /ERROR: 0:(\d+)/.exec( errors );
	if ( errorMatches ) {
		const errorLine = parseInt( errorMatches[ 1 ] );

		const shaderType = type === VERTEX_SHADER ? "vertex" : "fragment"; 

		return shaderType.toUpperCase() + '\n\n' + errors + '\n\n' + handleSource( gl.getShaderSource( shader ), errorLine );
	} else {
		return errors;
	}
}

function handleSource( string, errorLine ) {
	const lines = string.split( '\n' );
	const lines2 = [];

	const from = Math.max( errorLine - 6, 0 );
	const to = Math.min( errorLine + 6, lines.length );

	for ( let i = from; i < to; i ++ ) {

		const line = i + 1;
		lines2.push( `${line === errorLine ? '>' : ' '} ${line}: ${lines[ i ]}` );

	}

	return lines2.join( '\n' );
}
