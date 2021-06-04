import * as THREE from "three";

export let enabled = false;
export let duration = 10; //
export let fps = 25;

let mesh, scene, camera;

let color = Math.random() * 0xFFFFFF;

export let init = (props) => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 10;

    mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color, wireframe: true }));
    scene.add(mesh);
};

export let update = ({ props, time, deltaTime, playhead, renderer }) => {
    // mesh.rotation.x += 0.05;
    mesh.rotation.y += 0.03;

    renderer.render(scene, camera);
};

let _width, _height;

export let resize = (width, height) => {
    _width = width;
    _height = height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

export let dispose = () => {
    scene.remove(mesh);
};

export let props = {
    speed: {
        min: 1,
        max: 20,
        value: 1,
        folder: "Camera.Controls.Test"
    },
    color: {
        value: "0xFFFFFF",
        label: "Change color",
    },
    map: {
        value: "/cubes/map.jpg", // goes to specific assets
    }
};

// exclusive assets to load for this specific scene
export let assets = [
    "/scenes/cubes/map.jpg"
];

if (import.meta.hot) {
    console.log("HMR");

    import.meta.hot.dispose(() => {
        dispose();
    });

    import.meta.hot.accept(({ module }) => {
        init = module.init;
        init();

        resize = module.resize;
        resize(_width, _height);

        update = module.update;
        dispose = module.dispose;
    });
}
