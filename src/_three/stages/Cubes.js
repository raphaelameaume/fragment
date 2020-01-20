import { PerspectiveCamera, Mesh, BoxGeometry, MeshBasicMaterial, Texture, Scene, Vector3, Color } from "three";
import { Midi } from "../../core/Midi";
import { Audio } from "../../core/Audio.js";


function Cubes({ props, renderer }) {
    let scene, camera, mesh;

    function init() {
        camera = new PerspectiveCamera(45, renderer.dimensions.width / renderer.dimensions.height, 1, 1000);
        camera.position.z = 5;
        camera.lookAt(new Vector3());

        scene = new Scene();
        scene.background = new Color(0x00FF00);

        let geometry = new BoxGeometry(2, 2, 2);
        let material = new MeshBasicMaterial({
            color: 0x00FF00,
            map: new Texture(),
        });

        mesh = new Mesh(geometry, material);
        scene.add(mesh);


        console.log('no listener');
        props.texture.onChange = ({ image }) => {
            console.log('props texture changed');
            // material.map.image = image;
            // material.map.needsUpdate = true;

            console.log(props.texture);
        };
    }

    function update() {
        if (props.move.value) {
            mesh.rotation.x += 0.01 * props.speed.value;
            mesh.rotation.y += 0.01 * props.speed.value;
            mesh.rotation.z += 0.01 * props.speed.value;
        }

        if (props.texture.needsUpdate) {
            console.log('Cubes :: texture needsUpdate');
            material.map.needsUpdate = true;
        }

        let s = 1 + Audio.volume();
        mesh.scale.set(s, s, s);
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
                Midi.knob(5),
            ]
        },
        move: {
            value: true,
            triggers: [
                // Keyboard.key('m'),
                Midi.keydown(32),
            ]
        },
        texture: {
            type: "image",
            value: 'assets/images/render.png',
            
        },
    }
};