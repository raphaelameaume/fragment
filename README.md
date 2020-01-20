# Fragment

`fragment` is a web-based environment to create reactive A/V experiments with a built-in set of inputs, controls and GUI.

### Installation

```
npm install fragment
```

### Usage

*stage1.js*
```
import { Transform, Camera, Texture, Box, Program, Mesh } from "ogl";

function Cubes({ props, renderer }) {
    let { gl } = renderer;
    let uniforms = {
        uMap: { value: new Texture(renderer.gl)}
    }
    let scene, camera, mesh;

    function init() {
        //...init camera, scene and mesh;

        // set listener for prop
        props.texture.onChange = ({ image }) => {
            uniforms.uMap.value.image = image;
        };
    }

    function update({ deltaTime }) {
        uniforms.uScale.value = 1 + Audio.volume();

        if (props.move.value) {
            mesh.rotation.x += 0.001 * props.speed.value * deltaTime;
            mesh.rotation.y += 0.002 * props.speed.value * deltaTime;
            mesh.rotation.z += 0.003 * props.speed.value * deltaTime;
        }
    }

    function render({ renderer, gl, target }) {
        gl.clearColor(0.65, 0.53, 0.28, 1);
        renderer.render({ scene, camera, target });
    }

    function resize({ width, height }) {
        camera.perspective({ aspect: width / height });
    }

    init();

    return {
        canvas: renderer.canvas,
        update,
        render,
        resize,
    };
}

export default {
    name: 'Cubes',
    scene: Cubes,
    props: {
        speed: {
            min: 0,
            max: 1,
            value: 0.1,
        },
        move: {
            value: true,
        },
        texture: {
            type: "image",
            value: 'assets/images/render.png',
        },
    }
};
```


*main.js*
```
import { App } from "fragment";
import { OGLRenderer } from "fragment/examples/ogl/renderer.js";

new App({
    renderer: OGLRenderer(),
    stages,
});

```

### Motivation


### Roadmap

- Documentation
- Website

### License

MIT, see [LICENSE.md](http://github.com/raphaelameaume/fragment/blob/master/LICENSE.md) for details.
