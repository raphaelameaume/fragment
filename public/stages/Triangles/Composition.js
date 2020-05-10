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
    let height = side * 0.5 * Math.sqrt(3);
    let hypo = Math.cos(60 * Math.PI / 180) * radius;
    let phi = height - hypo;

    let grid = 32;
    let size = side * grid;
    let positions = [];
    
    for (let i = 0; i < (grid + 1); i++) {
        let x = i * radius - radius * grid * 0.5;
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
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
    });

    let geometryGrid = new THREE.PlaneBufferGeometry(side * 0.02, side * 0.02);
    let transformGrid = new THREE.Object3D();

    for (let i = 0; i < positions.length; i++) {
        let [ x, y ] = positions[i]; 

        let material = materialGrid;

        if (x === 0 && y === 0) {
            material = new THREE.MeshBasicMaterial({
                color: 0xFF0000,
                side: THREE.DoubleSide,
            });
            // material.color = 0xFF0000;
        }

        let mesh = new THREE.Mesh(geometryGrid, material);
        mesh.position.x = x;
        mesh.position.y = y;

        transformGrid.add(mesh);
    }

    transform.add(transformGrid);

    const SCALE_1 = 1;
    const SCALE_2 = 1.415;
    const SCALE_3 = 2.415;
    const SCALE_4 = 3.415;

    let pyramids = [
        // scale 4
        [ side * SCALE_4 / 2, radius * SCALE_4 / 2, SCALE_4, 0 ],
        [ side * SCALE_4 / 2, -radius * SCALE_4 / 2, SCALE_4, Math.PI ],
        [0, radius * SCALE_4, SCALE_4, Math.PI],
        [-side * SCALE_4 / 2, radius * SCALE_4 / 2, SCALE_4, 0],
        [-side * SCALE_4, radius * SCALE_4, SCALE_4, Math.PI],
        [-side * SCALE_4, radius * SCALE_4 * 2, SCALE_4, 0],

        // scale 3
        [side * SCALE_4 * 0.5 + side * SCALE_3 * 0.5, height * SCALE_4 - hypo * SCALE_3, SCALE_3, Math.PI],
        [0, -phi * SCALE_3, SCALE_3, 0],
        [0, -height * SCALE_3 - hypo * SCALE_3, SCALE_3, Math.PI],
        [-side * 0.5 * SCALE_3, -hypo * SCALE_3, SCALE_3, Math.PI],
        [side * 0.5 * SCALE_3, -height * SCALE_3 - phi * SCALE_3, SCALE_3, 0],
        [side * 0.5 * SCALE_3, -height * SCALE_3 * 2 - hypo * SCALE_3, SCALE_3, Math.PI],

        // scale 2 (from top to bottom from left to right)
        [-side * 0.5 * SCALE_4 - side * 0.5 * SCALE_2, height * SCALE_4 + height * SCALE_2 + phi * SCALE_2, SCALE_2, Math.PI],
        [-side * 0.5 * SCALE_4, height * SCALE_4 + phi * SCALE_2, SCALE_2, Math.PI],
        [-side * 1.5 * SCALE_4, height * SCALE_4 + phi * SCALE_2, SCALE_2, Math.PI],
        [-side * 1.5 * SCALE_4, height * SCALE_4 - phi * SCALE_2, SCALE_2, 0],
        [-side * 1.5 * SCALE_4 + side * 0.5 * SCALE_2, height * SCALE_4 - height * SCALE_2 - phi * SCALE_2, SCALE_2, 0],
        [-side * SCALE_3, -phi * SCALE_2, SCALE_2, 0],
        [side * SCALE_3, -2 * height * SCALE_3 + phi * SCALE_2, SCALE_2, Math.PI],
        [side * SCALE_3 + side * 0.5 * SCALE_2, -2 * height * SCALE_3 + hypo * SCALE_2, SCALE_2, 0],

        // scale 1
        [-side * 0.5 * SCALE_4 + side * SCALE_1 * 0.5, height * SCALE_4 + hypo, SCALE_1, 0],
        [-side * SCALE_4 * 1.5 + side * 0.5 * SCALE_2 - side * 0.5, radius * 2.5, SCALE_1, Math.PI],
        [-side * SCALE_3 - side * 0.5 * SCALE_1, -hypo * SCALE_1, SCALE_1, Math.PI],
        [-side * SCALE_3 + side * 0.5 * SCALE_2, -height * SCALE_2 - phi * SCALE_1, SCALE_1, 0],
        [-side * 0.5 * SCALE_1, -2 * height * SCALE_3 + hypo * SCALE_1, SCALE_1, 0],
    ];

    let uniforms = {
        uThickness: { value: 0.02 },
        uStrokeDiffuse: { value: new THREE.Color(props.strokeColor.value) },
        uFillDiffuse: { value: new THREE.Color(props.fillColor.value) },
    };

    props.strokeColor.onChange = () => {
        uniforms.uStrokeDiffuse.value = new THREE.Color(props.strokeColor.value);
    }

    props.fillColor.onChange = () => {
        uniforms.uFillDiffuse.value = new THREE.Color(props.fillColor.value);
    }

    props.thickness.onChange = () => {
        uniforms.uThickness.value = props.thickness.value;
    }

    props.showGrid.onChange = () => {
        transformGrid.visible = props.showGrid.value;
    };

    props.px.onChange = () => {
        transform.position.x = props.px.value;
    }

    props.py.onChange = () => {
        transform.position.y = props.py.value;
    }

    props.pz.onChange = () => {
        transform.position.z = props.pz.value;
    }

    props.scale.onChange = () => {
        transform.scale.set(props.scale.value, props.scale.value, props.scale.value);
    }

    props.rx.onChange = () => {
        transform.rotation.x = props.rx.value;
    }

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
    },
    px: {
        value: 0,
        min: -300,
        max: 300,
        step: 0.01
    },
    py: {
        value: 0,
        min: -300,
        max: 300,
        step: 0.01
    },
    pz: {
        value: 0,
        min: -300,
        max: 300,
        step: 0.01
    },
    rx: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01
    },
    scale: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.001,
    }
};

export default Composition;