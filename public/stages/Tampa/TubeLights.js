import Room from "./Room";
import TubeLight from "./TubeLight";

let vertexShader = /* glsl */`
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vec3 transformed = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    }
`;

let fragmentShaderShadow = /* glsl */`
    uniform vec3 diffuse;
    uniform float opacity;

    varying vec2 vUv;

    #include <common>

    void main() {
        float o = opacity;
        o *= sin(PI * vUv.x);
        o *= sin(PI * vUv.y);

        gl_FragColor = vec4(diffuse, o);
    }
`

function TubeLights() {
    let transform = new THREE.Object3D();

    let countY = 10;

    function createLightWall() {
        let transformWall = new THREE.Object3D();
        let spaceBetween = 0.2;
        let h = countY * TubeLight.radius + (countY - 1) * spaceBetween;

        for (let i = 0; i < countY; i++) {
            let light = TubeLight();
            light.transform.position.y = -h * 0.5 + i * TubeLight.radius + i * spaceBetween;
            transformWall.add(light.transform);
        }

        let shadowGeometry = new THREE.PlaneBufferGeometry(TubeLight.width * 2, h * 2);
        let shadowMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader: fragmentShaderShadow,
            uniforms: {
                diffuse: { value: new THREE.Color(0xFFFFFF) },
                opacity: { value: 0.2 },
            },
            transparent: true,
        })
        let shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
        transformWall.add(shadowMesh);

        return { transform: transformWall }
    }

    // back
    let lightWallBack = createLightWall();
    lightWallBack.transform.position.y = Room.height * 0.5;
    lightWallBack.transform.position.z = -Room.depth * 0.5 + TubeLight.radius + 0.01;
    transform.add(lightWallBack.transform);

    let lightWallFront = createLightWall();
    lightWallFront.transform.position.y = Room.height * 0.5;
    lightWallFront.transform.position.z = Room.depth * 0.5 - TubeLight.radius * 0.5;
    transform.add(lightWallFront.transform);

    let lightWallLeft = createLightWall();
    lightWallLeft.transform.position.y = Room.height * 0.5;
    lightWallLeft.transform.rotation.y = Math.PI * 0.5;
    lightWallLeft.transform.position.x = -Room.width * 0.5 + TubeLight.radius * 0.5;
    transform.add(lightWallLeft.transform);

    let lightWallRight = createLightWall();
    lightWallRight.transform.position.y = Room.height * 0.5;
    lightWallRight.transform.rotation.y = -Math.PI * 0.5;
    lightWallRight.transform.position.x = Room.width * 0.5 - TubeLight.radius * 0.5;
    transform.add(lightWallRight.transform);

    return {
        transform
    }
}

export default TubeLights;