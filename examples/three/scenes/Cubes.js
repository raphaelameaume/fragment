// import { Mouse, Keyboard, Audio, Midi } from "$fragment";
import * as THREE from "three";

export let enabled = false;
export let duration = 10; //
export let fps = 24;

export let init = (props) => {
    console.log("Scene :: init :: hello");
    const scene = new THREE.Scene()

    console.log(scene);
};

export let update = ({ props, time, deltaTime, playhead, renderer }) => {
    console.log("Cubes :: update");
};

export let resize = (width, height) => {
    console.log("Cubes :: resize");
};

export let props = {
    speed: {
        value: 1,
        max: 20,
        value: 1,
        folder: "Camera.Controls.Test"
    },
    color: {
        value: "0xFFFFFF",
        label: "Change color",
        triggers: [ // how do you reconciliate change from UI
        ]
    },
    map: {
        value: "/cubes/map.jpg", // goes to specific assets
    }
};

// exclusive assets to load for this specific scene
export let assets = [
    "/scenes/cubes/map.jpg"
];
