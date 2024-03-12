import p5 from 'p5';
import { client } from '@fragment/client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../stores/errors';

let previews = [];

export let onMountPreview = ({ id, width, height }) => {
	const p = new p5((sketch) => {
		sketch.setup = () => {
			sketch.createCanvas(width, height, 'webgl');
		};
	});

	const preview = {
		id,
		p,
	};

	previews.push(preview);

	return {
		canvas: p.canvas,
		p,
	};
};

export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = false;
	}
};

export let onAfterUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = true;
	}

	if (
		previews.every((preview) => preview.rendered) &&
		_shaderUpdates.length > 0
	) {
		clearShaderUpdates();
	}
};

export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.resizeCanvas(width * pixelRatio, height * pixelRatio, false);
	}
};

export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((preview) => preview.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		preview.p.remove();
	}

	previews.splice(previewIndex, 1);
};

/* HOT SHADER RELOADING */
const { shader } = p5.prototype;
const { useProgram } = p5.Shader.prototype;

p5.Shader.prototype.useProgram = function () {
	// avoid p5 throwing error covering shader syntax error overlay
	if (this._glProgram !== 0) {
		useProgram.call(this);
	}
};

p5.prototype.shader = function (s) {
	let needsUpdate = false;
	['_vertSrc', '_fragSrc'].forEach((key) => {
		const shader = s[key];
		const shaderPath = getShaderPath(shader);
		const shaderUpdate = _shaderUpdates.find(
			(shaderUpdate) => shaderUpdate.filepath === shaderPath,
		);

		if (shaderUpdate) {
			console.log(
				`[fragment-plugin-hsr] hsr update ${shaderPath.replace(
					__CWD__,
					'',
				)}`,
			);
			needsUpdate = true;

			s[key] = shaderUpdate.source;
		}
	});

	if (needsUpdate) {
		s.bindShader();
		s.unbindShader();

		// set it to undefined so it goes into useProgram when binded
		// see useProgram
		this._renderer._curShader = undefined;

		// set _glProgram so it compiles the shader again
		s._glProgram = 0;
		// set to false so it caches attributes and uniforms
		s._loadedAttributes = false;
		s._loadedUniforms = false;
		// empty samplers array because of samplers.push()
		s.samplers = [];

		// call s.init() and gl.useProgram
		s.bindShader();
	}

	return shader.call(this, s);
};

let _shaderUpdates = [];

function clearShaderUpdates() {
	_shaderUpdates = [];
}

if (import.meta.hot) {
	import.meta.hot.on('sketch-update', (data) => {
		clearShaderUpdates();
	});
}

client.on('shader-update', (shaderUpdates) => {
	previews.forEach(({ p }) => {
		clearError(p._renderer.GL.__uuid);
	});

	_shaderUpdates = shaderUpdates;
});
