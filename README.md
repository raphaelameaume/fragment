# Fragment

`fragment` is a web-based environment to create reactive A/V experiments with a built-in set of inputs, controls and GUI.

### Installation

```
npm install fragment
```

### Usage

**stage1.js**
```js
function Stage1({ props, renderer }) {
    function update({ deltaTime }) {
    }

    function render({ renderer, target }) {
    }

    function resize({ width, height }) {
    }

    return {
        canvas: renderer.canvas,
        update,
        render,
        resize,
    };
}

export default {
    name: 'Stage1',
    scene: Stage1,
};
```
**renderer.js**
```js
let renderer = function() {
    let canvas = document.createElement('canvas');
    let dimensions = {
        width: 1280,
        height: 720,
    };

    let dpr = 1;
    let props = {};

    function resize() {

    }

    function render() {

    }

    return {
        canvas,
        dimensions,
        dpr,
        resize,
        render,
    };
};
```

**main.js**
```js
import { App } from "fragment";
import Renderer from "./renderer.js";
import Stage1 from "./Stage1.js";

new App({
    renderer: Renderer(),
    stages: {
        Stage1,
    }
});
```

### Motivation


### Roadmap

- Documentation
- Website

### License

MIT, see [LICENSE.md](http://github.com/raphaelameaume/fragment/blob/master/LICENSE.md) for details.
