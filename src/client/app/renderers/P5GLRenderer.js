import p5 from 'p5';
import { client } from '../client';
import { getShaderPath } from '../utils/glsl.utils';
import { clearError } from '../state/errors.svelte';

/**
 * @typedef {object} MountParamsP5GLRenderer
 * @property {HTMLCanvasElement} canvas
 * @property {p5} p
 */

/**
 * @typedef {import('../state/rendering.svelte').PreviewParamsRenderer & MountParamsP5GLRenderer} PreviewParamsP5GLRenderer
 */

/**
 * @typedef {object} PreviewP5GLRenderer
 * @property {number} id
 * @property {p5} p
 * @property {boolean} rendered
 */

/** @type {PreviewP5GLRenderer[]} */
let previews = [];

/**
 * @param {object} params
 * @param {number} params.id
 * @param {HTMLDivElement} params.container
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @returns {MountParamsP5GLRenderer}
 */
export let onMountPreview = ({
	id,
	container,
	canvas,
	width,
	height,
	pixelRatio,
}) => {
	const p = new p5((sketch) => {
		sketch.setup = () => {
			const dpr = window.devicePixelRatio;
			sketch.pixelDensity(pixelRatio);
			sketch.createCanvas(
				(width / dpr) * pixelRatio,
				(height / dpr) * pixelRatio,
				'webgl',
				canvas,
			);
		};
	}, container);

	previews.push({
		id,
		p,
		rendered: false,
	});

	return {
		canvas,
		p,
	};
};

/**
 * @param {{ id: number }} params
 */
export let onBeforeUpdatePreview = ({ id }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.rendered = false;

		preview.p?.resetMatrix();
	}
};

/**
 * @param {{ id: number }} params
 */
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

/**
 * @param {PreviewParamsP5GLRenderer} params
 */
export let onResizePreview = ({ id, width, height, pixelRatio }) => {
	const preview = previews.find((p) => p.id === id);

	if (preview) {
		preview.p.pixelDensity(pixelRatio);
		preview.p.resizeCanvas(width, height, false);
	}
};

/**
 * @param {{ id: number }} params
 */
export let onDestroyPreview = ({ id }) => {
	const previewIndex = previews.findIndex((preview) => preview.id === id);
	const preview = previews[previewIndex];

	if (preview) {
		preview.p.remove();
	}

	previews.splice(previewIndex, 1);
};

/* HOT SHADER RELOADING */
/** @type {import('src/cli/plugins/hot-shader-replacement').ShaderUpdate[]} */
let _shaderUpdates = [];

function clearShaderUpdates() {
	_shaderUpdates = [];
}

const { shader } = p5.prototype;

// @ts-ignore
const { useProgram } = p5.Shader.prototype;
// @ts-ignore
p5.Shader.prototype.useProgram = function () {
	// avoid p5 throwing error covering shader syntax error overlay
	// @ts-ignore
	if (this._glProgram !== 0) {
		useProgram.call(this);
	}
};

// @ts-ignore
p5.prototype.shader = function (s) {
	let needsUpdate = false;
	['_vertSrc', '_fragSrc'].forEach((key) => {
		const shader = s[key];
		const shaderPath = getShaderPath(shader);
		const shaderUpdate = _shaderUpdates.find(
			(shaderUpdate) => shaderUpdate.filepath === shaderPath,
		);

		if (shaderUpdate && shaderPath) {
			if (__CWD__) {
				console.log(
					`[fragment-plugin-hsr] hsr update ${shaderPath.replace(
						__CWD__,
						'',
					)}`,
				);
			}
			needsUpdate = true;

			s[key] = shaderUpdate.source;
		}
	});

	if (needsUpdate) {
		s.bindShader();
		s.unbindShader();

		// set it to undefined so it goes into useProgram when binded, see useProgram
		// @ts-ignore
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

if (import.meta.hot) {
	import.meta.hot.on('sketch-update', () => {
		clearShaderUpdates();
	});
}

client.on(
	'shader-update',
	/** @param {import('src/cli/plugins/hot-shader-replacement').ShaderUpdate[]} shaderUpdates */ (
		shaderUpdates,
	) => {
		previews.forEach(({ p }) => {
			//@ts-ignore
			clearError(p._renderer.GL.__uuid);
		});

		_shaderUpdates = shaderUpdates;
	},
);
