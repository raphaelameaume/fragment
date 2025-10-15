import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** @type {THREE.PerspectiveCamera} */
let camera;
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.Mesh} */
let cube;
let spotLight;
/** @type {THREE.SpotLightHelper} */
let lightHelper;
/** @type {THREE.CameraHelper} */
let lightCameraHelper;

export let props = {
	color: {
		value: '#90e364',
		onChange: ({ value }) => {
			cube.material.color.set(value);
		},
		displayName: 'Cube Color',
	},
	speed: {
		value: 1,
		params: {
			min: 0,
			max: 2,
			step: 0.01,
		},
		displayName: 'Cube Speed',
	},
	positionX: {
		value: 0,
		params: {
			min: -10,
			max: 10,
			step: 0.01,
		},
		onChange: ({ value }) => {
			cube.position.x = value;
		},
		displayName: 'Cube Position X',
	},
	positionY: {
		value: 0,
		params: {
			min: -10,
			max: 10,
			step: 0.01,
		},
		onChange: ({ value }) => {
			cube.position.y = value;
		},
		displayName: 'Cube Position Y',
	},
	positionZ: {
		value: 0,
		params: {
			min: -10,
			max: 10,
			step: 0.01,
		},
		onChange: ({ value }) => {
			cube.position.z = value;
		},
		displayName: 'Cube Position Z',
		disabled: true,
	},
	animatePosition: {
		value: false,
		// disabled: true,
	},
	lightSettings: {
		value: () => {
			props.lightHelper.hidden = !props.lightHelper.hidden;
			props.lightPosition.hidden = !props.lightPosition.hidden;
			props.lightAngle.hidden = !props.lightAngle.hidden;
		},
		params: {
			label: 'Toggle Light Settings',
		},
		displayName: null,
	},
	lightHelper: {
		value: false,
		onChange: ({ value }) => {
			if (value && !lightHelper) {
				lightHelper = new THREE.SpotLightHelper(
					spotLight,
					new THREE.Color('red'),
				);
				scene.add(lightHelper);

				lightCameraHelper = new THREE.CameraHelper(
					spotLight.shadow.camera,
				);
				scene.add(lightCameraHelper);
			} else {
				lightHelper?.removeFromParent();
				lightHelper = undefined;

				lightCameraHelper?.removeFromParent();
				lightCameraHelper = undefined;
			}
		},
		hidden: true,
	},
	lightPosition: {
		value: { x: 0, y: 100, z: -20 },
		onChange: ({ value }) => {
			spotLight.position.copy(value);
			lightHelper?.update();
		},
		hidden: true,
	},
	lightAngle: {
		value: Math.PI * 0.1,
		params: {
			min: 0,
			max: Math.PI * 0.25,
			step: 0.001,
		},
		onChange: ({ value }) => {
			spotLight.angle = value;
			lightHelper?.update();
			lightCameraHelper?.update();
		},
		hidden: true,
	},
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {THREE.Scene} params.scene
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let init = ({ renderer, width, height }) => {
	renderer.shadowMap.enabled = true;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);

	camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
	camera.position.z = 100;
	camera.lookAt(new THREE.Vector3());

	const ambientLight = new THREE.AmbientLight(0xffffff);
	scene.add(ambientLight);

	spotLight = new THREE.SpotLight(0xffffff, 4.5);
	spotLight.position.set(0, 100, -20);
	spotLight.angle = props.lightAngle.value;
	spotLight.decay = 0;
	spotLight.castShadow = true;
	spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 150;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
	scene.add(spotLight);

	const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
	floorGeometry.rotateX(-Math.PI / 2);
	const floorMaterial = new THREE.ShadowMaterial({
		color: 0x000000,
		opacity: 0.2,
	});

	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -30;
	floor.receiveShadow = true;
	scene.add(floor);

	const helper = new THREE.GridHelper(500, 50);
	helper.position.y = floor.position.y + 0.1;
	helper.material.opacity = 0.25;
	helper.material.transparent = true;
	scene.add(helper);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.damping = 0.2;

	cube = new THREE.Mesh(
		new THREE.BoxGeometry(20, 20, 20),
		new THREE.MeshStandardMaterial({
			color: props.color.value,
		}),
	);
	cube.position.set(
		props.positionX.value,
		props.positionY.value,
		props.positionZ.value,
	);
	cube.castShadow = true;
	scene.add(cube);

	props.lightHelper.onChange(props.lightHelper);
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {THREE.Scene} params.scene
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 * @param {number} params.time
 * @param {number} params.deltaTime
 * @param {number} params.frame
 * @param {number} params.playhead
 * @param {number} params.playcount
 */
export let update = ({ renderer, time, deltaTime }) => {
	const speed = props.speed.value;

	cube.rotation.x += (speed * deltaTime) / 1000;
	cube.rotation.y += (speed * deltaTime) / 1000;

	if (props.animatePosition.value) {
		// this will trigger the onChange callback of props.positionX
		props.positionX.value =
			Math.sin(time / 1000) * props.positionX.params.max;
	}

	renderer.render(scene, camera);
};

/**
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {THREE.WebGLRenderer} params.renderer
 * @param {THREE.Scene} params.scene
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.pixelRatio
 */
export let resize = ({ width, height }) => {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
};

export let rendering = 'three';
export let name = 'THREE.js Cube Example';

export let buildConfig = {
	layout: {
		headless: true,
	},
};
