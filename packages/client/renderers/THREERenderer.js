import { WebGLRenderer } from "three";

let renderer;

export let init = () => {
    renderer = new WebGLRenderer({ antialias: true });

    document.body.appendChild(renderer.domElement);

    return renderer;
};

export let resize = () => {

};

export let render = ({ mode, stages }) => {

}

export let update = ({ stages }) => {
    for (let i = 0; i < stages.length; i++) {
        stages[i].update();
    }
};
