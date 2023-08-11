#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Hot shader replacement</sup>
<br>

# Hot shader replacement

The same way [vite](https://vitejs.dev/) provides instant updates to your sketch with its [HMR API](https://vitejs.dev/guide/features.html#hot-module-replacement), `fragment` provides instant updates to shaders when using the following file extensions:
- `.glsl`
- `.fs`
- `.vs`
- `.vert`
- `.frag`

Hot shader replacement is enabled by default when using `rendering="three"` or `rendering="fragment"`.

## How does it work?

When `fragment` encounters a file with an extension listed above, it adds a comment to the shader file with its path on the user filesystem like so:

```glsl
// <filepath://path/to/shader/on/filesystem>
```

When the file or one of its dependency changes, instead of letting [vite](https://vitejs.dev/) do its work, `fragment` recompiles only the shader and sends it over a Websocket. The different [renderers](../api/renderers.md) listen to the event sent by the Websocket, retrieve the updated shader(s) and recompile the WebGL program(s) on the fly.

### With `rendering="three"`

When using [three.js](https://threejs.org/) rendering, `fragment` overrides the `render` method of the provided `renderer:WebGLRenderer` to traverse the scene before rendering it and check if some materials needs to be recompiled with the updated source code.
This technique works when using `ShaderMaterial` and/or `RawShaderMaterial` like in this example:

```js
import * as THREE from 'three';
import customVertexShader from './custom.vert';
import customFragmentShader from './custom.frag';

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
> ⚠️ If you use your own `Renderer` instance, `fragment` will not be able to retrieve the materials that needs an update before rendering.

### With `rendering="fragment"`

The single WebGLProgram displayed is recompiled on the fly.

## How to disable it?

A `// @fragment-nohsr` at the top of the file will disable Hot Shader Replacement and triggers a sketch reload instead when shader changes.
