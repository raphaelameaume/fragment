import { Mouse, Keyboard, Audio, Midi } from "fragment";

export let enabled = false;
export let duration = 10; //
export let fps = 24;

let scene, camera, mesh;

export let init = (props) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();

    uniforms = {
        speed: props.speed,
    }

    props.diffuse.onChange(() => {
        uniforms.diffuse.value = new THREE.Color(props.diffuse.value);
    });

    props.color.onTrigger(() => {

    });

    props.map.onChange(() => {

    })

    mesh = new Mesh();
};

export let update = ({ props, time, deltaTime, playhead, renderer }) => {
    // if export duration, then playhead is available as 0 => 1
    // we need to be able to access webglRenderer here

    mesh.rotation.x += 0.1;

    mesh.rotation.y = Mouse.y * Math.PI;

    // renderer is a fragment renderer

    renderer.render(scene, camera); // this could be done like that if we set the render target before calling update ?
};

export let resize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

export let props = {
    speed: {
        value: 1,
        max: 20,
        value: 1,
        folder: "Camera.Controls.Test"
    },
    color: {
        value: "0xFFFFF",
        label: "Change color",
        triggers: [ // how do you reconciliate change from UI
            Mouse.click(),
            Keyboard.key("m"),
            Midi.keydown(32),
            Audio.beat(0)
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
