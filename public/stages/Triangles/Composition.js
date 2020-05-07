import { Audio } from "../../build/bundle.js";
import { unindexBufferGeometry, addBarycentricCoordinates } from "./geometryUtils";

const vertexShader = /* glsl */`
    attribute vec3 barycentric;
    attribute float even;

    varying vec3 vBarycentric;
    varying vec3 vPosition;
    varying float vEven;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vBarycentric = barycentric;
        vPosition = position.xyz;
        vEven = even;

        vec3 transformed = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    }
`;

const fragmentShader = /* glsl */`
    uniform vec3 uFillDiffuse;
    uniform vec3 uStrokeDiffuse;
    uniform float uThickness;
    varying vec2 vUv;

    #include <common>

    varying vec3 vBarycentric;

    bool seeThrough = false;
    bool insideAltColor = false;

    vec3 fill = uFillDiffuse;
    vec3 stroke = uStrokeDiffuse;

    float thickness = uThickness;

    float aastep (float threshold, float dist) {
        float afwidth = fwidth(dist) * 0.5;
        return smoothstep(threshold - afwidth, threshold + afwidth, dist);
    }

    vec4 wireframe(vec3 barycentric) {
        float d = min(min(barycentric.x, barycentric.y), barycentric.z);

        vec4 outColor = vec4(0.0);

        float computedThickness = thickness;

        float edge = 1.0 - aastep(computedThickness, d);

        if (seeThrough) {
            outColor = vec4(stroke, edge);
            if (insideAltColor && !gl_FrontFacing) {
                outColor.rgb = fill;
            }
        } else {
            vec3 mainStroke = mix(fill, stroke, edge);
            outColor.a = 1.0;
            // if (dualStroke) {
            //     float inner = 1.0 - aastep(secondThickness, d);
            //     vec3 wireColor = mix(fill, stroke, abs(inner - edge));
            //     outColor.rgb = wireColor;
            // } else {
            outColor.rgb = mainStroke;
            // }
        }

        return outColor;
    }

    void main() {
        gl_FragColor = wireframe(vBarycentric);
    }
`;

function Composition(props) {
    let transform = new THREE.Object3D();

    let radius = 1;
    let side = radius * Math.sqrt(3);
    let grid = 32;
    let size = side * grid;
    let positions = [];
    
    for (let i = 0; i < (grid + 1); i++) {
        let x = i / grid * size - size * 0.5;
        for (let j = 0; j < (grid + 1); j++) {
            let y = j * radius - radius * grid * 0.5;

            positions.push([x, y]);
        }
    }
    
    let geometryPyr = new THREE.ConeBufferGeometry(radius, radius, 3);
    geometryPyr.rotateY(Math.PI);
    geometryPyr.rotateX(Math.PI * 0.5);

    unindexBufferGeometry(geometryPyr);
    addBarycentricCoordinates(geometryPyr);


    let materialPyr = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        wireframe: true,
    });

    let materialGrid = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
    });

    let geometryGrid = new THREE.PlaneBufferGeometry(side * 0.1, side * 0.1);
    let transformGrid = new THREE.Object3D();

    for (let i = 0; i < positions.length; i++) {
        let [ x, y ] = positions[i]; 

        let material = materialGrid;

        if (x === 0 && y === 0) {
            material = new THREE.MeshBasicMaterial({
                color: 0xFF0000
            });
            // material.color = 0xFF0000;
        }

        let mesh = new THREE.Mesh(geometryGrid, material);
        mesh.position.x = x;
        mesh.position.y = y;

        transformGrid.add(mesh);
    }

    transform.add(transformGrid);

    let pyramids = [
        // scale 4
        [ side * 2, radius * 2, 4, 0 ],
        [ side * 2, -radius * 2, 4, Math.PI ],
        [0, radius * 4, 4, Math.PI],
        [-side * 2, radius * 2, 4, 0],
        [-side * 4, radius * 4, 4, Math.PI],
        [-side * 4, radius * 8, 4, 0],

        // scale 3
        [side * 3.5, radius * 4.5, 3, Math.PI],
        [0, -radius * 3, 3, 0],
        [0, -radius * 6, 3, Math.PI],
        [-side * 1.5, -radius * 1.5, 3, Math.PI],
        [side * 1.5, -radius * 7.5, 3, 0],
        [side * 1.5, -radius * 10.5, 3, Math.PI],

        // scale 2 (from top to bottom from left to right)
        [-side * 3, radius * 11, 2, Math.PI],
        [-side * 2, radius * 8, 2, Math.PI],
        [-side * 6, radius * 8, 2, Math.PI],
        [-side * 6, radius * 4, 2, 0],
        [-side * 5, radius * 1, 2, 0],
        [-side * 3, radius * -2, 2, 0],
        [side * 3, radius * -7, 2, Math.PI],
        [side * 4, radius * -8, 2, 0],

        // scale 1
        [-side * 1.5, radius * 6.5, 1, 0],
        [-side * 5.5, radius * 2.5, 1, Math.PI],
        [-side * 3.5, radius * -0.5, 1, Math.PI],
        [-side * 2, radius * -4, 1, 0],
        [-side * 0.5, radius * -8.5, 1, 0],
    ];

    let uniforms = {
        uThickness: { value: 0.02 },
        uStrokeDiffuse: { value: new THREE.Color(props.strokeColor.value) },
        uFillColor: { value: new THREE.Color(props.fillColor.value) },
    };

    props.strokeColor.onChange = () => {
        uniforms.uStrokeDiffuse.value = new THREE.Color(props.strokeColor.value);
    }

    props.fillColor.onChange = () => {
        uniforms.uStrokeDiffuse.value = new THREE.Color(props.fillColor.value);
    }

    props.thickness.onChange = () => {
        uniforms.uThickness.value = props.thickness.value;
    }

    props.showGrid.onChange = () => {
        transformGrid.visible = props.showGrid.value;
    };

    materialPyr = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        extensions: {
            derivatives: true
        }
    })

    for (let i = 0; i < pyramids.length; i++) {
        let [ x, y, scale, rotationZ ] = pyramids[i];

        let mesh = new THREE.Mesh(geometryPyr, materialPyr);
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = scale * 0.5;
        mesh.scale.set(scale, scale, scale);
        mesh.rotation.z = rotationZ;

        transform.add(mesh);
    }

    function update() {
        console.log(Audio.volume());

        uniforms.uThickness.value = props.thickness.value + Audio.volume() * props.volumeInfluence.value;
    }

    return {
        transform,
        update,
    };
}

Composition.props = {
    fillColor: {
        type: 'color',
        value: '#000000',
    },
    strokeColor: {
        type: 'color',
        value: '#ffffff',
    },
    thickness: {
        min: 0,
        max: 1,
        step: 0.001,
        value: 0.2,
    },
    showGrid: {
        value: true,
    },
    volumeInfluence: {
        value: 0.08,
        min: 0,
        max: 0.5,
        step: 0.01,
    }
};

export default Composition;