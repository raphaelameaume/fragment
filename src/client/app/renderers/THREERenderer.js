// import { WebGLRenderer } from "three";

export let renderer;
export let canvas;

class Renderer {

    constructor() {
        this.domElement = document.createElement("canvas");

        this.context = this.domElement.getContext("2d");
    }

    setPixelRatio(dpr) {
        this.dpr = dpr;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.domElement.width = this.width;
        this.domElement.height = this.height;
    }
}

export let init = () => {
    renderer = new Renderer();
    canvas = renderer.domElement;
};

export let resize = ({ width, height, dpr }) => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
};

export let render = ({ renderer }) => {
    renderer.context.fillStyle = '#ff0000';
    renderer.context.fillRect(0, 0, renderer.width, renderer.height);

    const size = renderer.width * 0.15;

    renderer.context.fillStyle = '#ffffff';
    renderer.context.fillRect(
        renderer.width * 0.5 - size * 0.5,
        renderer.height * 0.5 - size * 0.5,
        size,
        size,
    );
};
