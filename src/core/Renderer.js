import { Renderer } from "ogl";

export default function ({ width = window.innerWidth * 0.5, height = window.innerHeight * 0.5 } = {}) {
    let dimensions = { width, height };
    let renderer = new Renderer({ dpr: 1 });
    let gl = renderer.gl;

    // debug();

    function debug() {
        let canvas = gl.canvas;
        canvas.style.position = 'absolute';
        canvas.style.bottom = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = 999;
    
        document.body.appendChild(canvas);
    }

    function resize({ width = w, height = h } = {}) {
        dimensions.width = width;
        dimensions.height = height;

        renderer.setSize(width, height);
    }

    resize({ width, height });

    return {
        renderer,
        gl,
        resize,
        dimensions,
    };
};