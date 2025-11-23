# Hot shader replacement

Similar to how [Vite](https://vitejs.dev/) provides instant updates via its [HMR API](https://vitejs.dev/guide/features.html#hot-module-replacement),
Fragment provides automatic updates for shaders when using the following file extensions:
- `.glsl`
- `.fs`
- `.vs`
- `.vert`
- `.frag`

Hot shader replacement is enabled by default when `rendering` is set to `"three"`, `"p5-wegl"` or `"fragment"`.

## How it works

When Fragment detects a file with one of the supported extensions, it inserts a comment with the file's path on the local filesystem:

```glsl
// <filepath://path/to/shader/on/filesystem>
```

If the file or one of its dependencies changes, Fragment recompiles only the shader and sends it via WebSocket, bypassing Vite's standard reload process. Built-in [renderers](../api/renderers.md) listen for this event, retrieve the updated shader(s), and recompile the corresponding WebGL program(s) in real time.

> When using a custom `renderer`, Fragment cannot automatically detect which materials need shader updates before rendering.

### With `rendering="three"`

When using [three.js](https://threejs.org/), Fragment overrides the `render` method of the `WebGLRenderer` to traverse the scene before rendering. Materials that require recompilation are updated with the latest shader source.
This approach works with `ShaderMaterial` and/or `RawShaderMaterial`:

```js
import * as THREE from 'three';
import customVertexShader from '/path/to/custom.vert';
import customFragmentShader from '/path/to/custom.frag';

export let rendering = 'three';

let camera;

export let init = ({ scene, width, height }) => {
	camera = new THREE.OrthographicCamera(-1, 1, -1, 1, 1, 1000);
  	camera.position.z = 1;

	let mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(width, height),
		new THREE.ShaderMaterial({
			vertexShader: customVertexShader,
			fragmentShader: customFragmentShader,
			uniforms: {}
		})
	);
	scene.add(mesh);
};

export let update = ({ renderer, scene }) => {
	renderer.render(scene, camera);
};
```

### With `rendering="p5-webgl"`

Shader updates are intercepted and applied dynamically by replacing vertex and fragment source code in the p5 instance. Uniforms, attributes, and samplers are reset to ensure the shader recompiles correctly. Errors in shader compilation are cleared automatically before applying updates, preventing runtime issues.

### With `rendering="fragment"`

The single WebGL program displayed by Fragment is recompiled on the fly when the shader file changes.

## Disabling hot shader replacement

Adding `// @fragment-nohsr` at the top of a shader file disables hot shader replacement. Shader changes will then trigger a full sketch reload instead of an on-the-fly update.
