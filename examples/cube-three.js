import * as THREE from 'three';

let scene;

export let props = {
	backgroundColor: {
		value: '#ffffff',
		onChange: ({ value }) => {
			// scene.background = new THREE.Color(value);
			scene.background.set(value);
		},
	},
	color: {
		value: '#f46767',
		onChange: ({ value }) => {
			mesh.material.color.set(value);
		},
	},
	speed: {
		value: 0.3,
		params: {
			min: 0,
			max: 2,
			step: 0.01,
		},
	},
};

export let init = ({ width, height }) => {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	camera.position.z = 3;
	camera.lookAt(new THREE.Vector3());

	scene.background = new THREE.Color(props.backgroundColor.value);

	let ambientLight = new THREE.AmbientLight(0xffffff);
	scene.add(ambientLight);

	let dirLight = new THREE.DirectionalLight(0xff0000);
	dirLight.position.x = 1;
	dirLight.position.y = 1;
	dirLight.position.z = 1;
	dirLight.lookAt(new THREE.Vector3(0, 0, 0));
	// scene.add(dirLight);

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial({
			color: props.color.value,
			// wireframe: true,
		}),
	);

	scene.add(mesh);
	export let update = ({ renderer, time, deltaTime, playhead }) => {
	mesh.rotation.y += 0.001 * props.speed.value * deltaTime;
	// mesh.position.y = Math.sin(playhead * Math.PI) * 0.4;

	renderer.render(scene, camera);
};

	
	console.log(camera.aspect, width, height);
	camera.updateProjectionMatrix();
};

export let rendering = 'three';
export let duration = 2;
