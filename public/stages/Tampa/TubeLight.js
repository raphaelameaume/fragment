import Room from "./Room";

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

function TubeLight() {
    let transform = new THREE.Object3D();

    let length = TubeLight.width;
    let radiusLight = TubeLight.radius * 0.5;
    let radiusGlass = TubeLight.radius;

    let color = Math.random() * 0xFFFFFF;
    color = 0xFFFFFF

    let lightGeometry = new THREE.CylinderBufferGeometry(radiusLight, radiusLight, length, 32, 1, true);
    lightGeometry.rotateZ(Math.PI * 0.5);
    let lightMaterial = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        // wireframe: true,
    });

    let light = new THREE.Mesh(lightGeometry, lightMaterial);
    transform.add(light);

    let glassGeometry = new THREE.CylinderBufferGeometry(radiusGlass, radiusGlass, length, 32, 1, true);
    glassGeometry.rotateZ(Math.PI * 0.5);

    let glassMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide,
    });

    let glass = new THREE.Mesh(glassGeometry, glassMaterial);
    transform.add(glass);

    let radiusPiece = radiusGlass * 1.02;
    let lengthPiece = length * 0.05;

    let pieceGeometry = new THREE.CylinderBufferGeometry(radiusPiece, radiusPiece, lengthPiece, 32, 1, false);
    pieceGeometry.rotateZ(Math.PI * 0.5);
    let pieceMaterial = new THREE.MeshBasicMaterial({
        color: 0xE0E0E0,
    });
    let pieceLeft = new THREE.Mesh(pieceGeometry, pieceMaterial);
    pieceLeft.position.x = -length * 0.5 + lengthPiece * 0.5;
    transform.add(pieceLeft);

    let pieceRight = new THREE.Mesh(pieceGeometry, pieceMaterial);
    pieceRight.position.x = length * 0.5 - lengthPiece * 0.5;
    transform.add(pieceRight);

    const tubeLight = {
        color,
        transform,
    };

    return tubeLight;
}

TubeLight.radius = 0.06;
TubeLight.width = 5;

export default TubeLight;