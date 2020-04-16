function Cubes({ props, renderer }) {
    let scene, camera, mesh;

    function init() {
        camera = new THREE.PerspectiveCamera(45, renderer.dimensions.width / renderer.dimensions.height, 1, 1000);
        camera.position.z = 5;
        camera.lookAt(new THREE.Vector3());

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x00FF00);

        let geometry = new THREE.BoxGeometry(2, 2, 2);
        let material = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            map: new THREE.Texture(),
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);


        props.texture.onChange = ({ image }) => {
            material.map.image = image;
            material.map.needsUpdate = true;
        };
    }

    function update() {
        if (props.move.value) {
            mesh.rotation.x += 0.01 * props.speed.value;
            mesh.rotation.y += 0.01 * props.speed.value;
            mesh.rotation.z += 0.01 * props.speed.value;
        }

        if (props.texture.needsUpdate) {
            material.map.needsUpdate = true;
        }

        // let s = 1 + Audio.volume();
        // mesh.scale.set(s, s, s);
    }

    function render({ renderer }) {
        renderer.render(scene, camera);
    }

    function resize({ width, height }) {
    }

    init();

    return {
        canvas: renderer.canvas,
        update,
        render,
    };
}

export default {
    name: 'Cubes',
    scene: Cubes,
    props: {
        speed: {
            min: 0,
            max: 20,
            value: 1,
            triggers: [
                // Midi.knob(5),
            ]
        },
        move: {
            value: true,
            triggers: [
                // Keyboard.key('m'),
                // Midi.keydown(32),
            ]
        },
        texture: {
            type: "image",
            value: 'assets/images/render.png',
        },
    }
};