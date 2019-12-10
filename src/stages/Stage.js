import { Transform } from "ogl";

class Scene {

    constructor({ name, renderer, gl, props }) {
        this.name = name;
        this.renderer = renderer;
        this.gl = gl;
        this.props = props;

        this.scene = new Transform();
    }

    update() {

    }

    render() {

    }
}

export default Scene;