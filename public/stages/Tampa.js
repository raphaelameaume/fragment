import Floor from "./Tampa/Floor.js";
import Room from "./Tampa/Room.js";
import Hole from "./Tampa/Hole.js";
import Shape from "./Tampa/Shape.js";
import Ceiling from "./Tampa/Ceiling.js";
import Lights from "./Tampa/Lights.js";
import Particles from './Tampa/Particles.js';
import Uniforms from './Tampa/Uniforms.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function Tampa({ props, renderer }) {
    let scene = new THREE.Scene();
    scene.position.y = -Room.height * 0.5;

    let camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(0, 3, 4);
    camera.lookAt(new THREE.Vector3());

    let shape = Shape();
    scene.add(shape.transform);

    const lights = Lights();
    scene.add(lights.transform);

    const room = Room();
    scene.add(room.transform);

    const hole = Hole();
    scene.add(hole.transform);

    const ceiling = Ceiling();
    scene.add(ceiling.transform);

    const floor = Floor();
    scene.add(floor.transform);

    const particles = Particles();
    scene.add(particles.transform);

    const controls = new OrbitControls(camera, document.querySelector('.output'));

    props.roomDiffuse.onChange = ({ value }) => {
        Uniforms.get('roomDiffuse').value = new THREE.Color(props.roomDiffuse.value);
    }

    props.roomAOIntensity.onChange = () => {
        Uniforms.get('roomAOIntensity').value = props.roomAOIntensity.value;
    }
    
    function update({ time, deltaTime }) {
        Uniforms.update({ time, deltaTime });

        controls.update();

        // mesh.rotation.y = time * (10 * Math.PI / 180);
        // mesh.position.y = Math.sin(time);
    }

    function render({ renderer }) {
        renderer.setClearColor('#000', 1);
        renderer.render(scene, camera);
    }

    function resize() {

    }

    return {
        canvas: renderer.canvas,
        update,
        render,
        resize,
    };
}

export default {
    name: 'Tampa',
    scene: Tampa,
    props: {
        roomDiffuse: {
            type: 'color',
            value: '#ff0000',
        },
        roomAOIntensity: {
            min: 0,
            max: 1,
            value: 0.2,
            step: 0.01,
        }
    },
};

    


