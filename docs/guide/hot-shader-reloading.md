#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Hot shader reloading</sup>
<br>

# Hot shader reloading

Instead of using built-in HMR features of [vite](https://vitejs.dev/), `fragment` has its own way of reloading shaders when it encounters files with the following extensions:
- `.glsl`
- `.fs`
- `.vs`
- `.vert`
- `.frag`

## With `rendering="three"`

When using [three.js](https://threejs.org/) rendering, `fragment` will traverse the `scene` provided in the params to see if the file recently saved has a filepath that matches a `fragmentShader` or `vertexShader` provided to a `ShaderMaterial` or a `RawShaderMaterial`.
If you're using your own `Scene` instance, `fragment` will not be able to retrieve the materials currently in use and will reload the whole sketch instead.

## With `rendering="fragment"`

The single WebGLProgram displayed is recompiled on the fly.
