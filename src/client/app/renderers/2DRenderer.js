export let renderer;
export let canvas;

let context;

export let init = () => {
    canvas = document.createElement('canvas');
    context = canvas.getContext("2d");

    renderer = {
        context,
    };
};

export let resize = ({ width, height, dpr, sketches = [] }) => {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
};

export let render = ({ sketches = [] }) => {

};
