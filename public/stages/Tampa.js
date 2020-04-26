import Floor from "./Tampa/Floor.js";
import Room from "./Tampa/Room.js";
import Hole from "./Tampa/Hole.js";
import Shape from "./Tampa/Shape.js";
import Camera from "./Tampa/Camera.js";
import Ceiling from "./Tampa/Ceiling.js";
import Lights from "./Tampa/Lights.js";
import Structure from "./Tampa/Structure.js";
import Particles from './Tampa/Particles.js';
import TubeLights from './Tampa/TubeLights.js';
import Uniforms from './Tampa/Uniforms.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function Tampa({ props, renderer }) {
    let scene = new THREE.Scene();
    scene.position.y = -Room.height * 0.5;

    // let camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    // camera.position.set(0, 3, 4);
    // camera.lookAt(new THREE.Vector3());

    let camera = Camera({
        aspect: renderer.canvas.width / renderer.canvas.height,
    });

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

    const tubeLights = TubeLights();
    scene.add(tubeLights.transform);

    const structure = Structure();
    scene.add(structure.transform);

    props.structureVisibility.onChange = () => {
        let visible = props.structureVisibility.value;
        structure.transform.visible = visible;
        
        // ceiling.transform.visible = !visible;
        room.transform.visible = !visible;
        // floor.transform.visible = !visible;
        tubeLights.transform.visible = !visible;
        // hole.transform.visible = !visible;
    }

    let controls;

    controls = new OrbitControls(camera.camera, document.querySelector('.output'));
    controls.target = new THREE.Vector3(0, 0, 0);

    props.orbits.onChange = () => {
        controls.enabled = props.orbits.value;
    };

    props.roomDiffuse.onChange = ({ value }) => {
        Uniforms.get('roomDiffuse').value = new THREE.Color(props.roomDiffuse.value);
    }

    props.roomAOIntensity.onChange = () => {
        Uniforms.get('roomAOIntensity').value = props.roomAOIntensity.value;
    }
    
    function update({ time, deltaTime }) {
        Uniforms.update({ time, deltaTime });

        if (controls) {
            controls.update();
        }

        camera.update({ time, deltaTime });
        shape.update({ time, deltaTime });

        // if (structure.transform.visible) {
        //     scene.rotation.x += deltaTime * 0.001;
        //     scene.rotation.y += deltaTime * 0.001;
        //     scene.rotation.z += deltaTime * 0.001;
        //     camera.camera.lookAt(new THREE.Vector3(0, Room.height * 0.5, 0));
        // } else {
        //     scene.rotation.x = 0;
        //     scene.rotation.y = 0;
        //     scene.rotation.z = 0;
        // }
    }

    function render({ renderer }) {
        renderer.setClearColor('#000', 1);
        renderer.render(scene, camera.camera);
    }

    function resize() {
        console.log('Tampa :: resize');
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
        orbits: {
            value: true,
        },
        roomDiffuse: {
            type: 'color',
            value: '#ff0000',
        },
        roomAOIntensity: {
            min: 0,
            max: 1,
            value: 0.2,
            step: 0.01,
        },
        structureVisibility: {
            value: false,
        }
    },
};

    


