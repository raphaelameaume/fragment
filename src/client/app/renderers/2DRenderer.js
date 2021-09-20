export let renderer;
export let canvas;

let context;

export let init = () => {
    canvas = document.createElement('canvas');
    context = canvas.getContext("2d");

    renderer = {
        context,
    };

    console.log("2DRenderer :: init");
};

export let resize = ({ width, height, dpr }) => {
    console.log("2DRenderer :: resize", width, height);
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
};

export let render = () => {

};
