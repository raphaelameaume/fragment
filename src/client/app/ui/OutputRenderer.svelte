<script>
import { onDestroy, onMount } from "svelte";
import { fragment, Texture } from "../lib/gl";
import { monitors } from "../modules/Monitor.svelte";
import { transitions } from "../transitions/index.js";
import { canvases, current as currentRendering } from "../stores/rendering.js";
import { multisampling, threshold, transition } from "../stores/multisampling.js";

export let paused = false;

let _raf;
let canvas;
let output;
let _mounted;
let uniforms = {
    threshold: { value: 0, type: "float" },
    uSampler0: { value: null, type: "sampler2D" },
    uSampler1: { value: null, type: "sampler2D" },
}

let defaultFragmentShader = /* glsl */`
precision highp float;

uniform float threshold;
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

varying vec2 vUv;

void main() {
    vec4 mapTexel0 = texture2D(uSampler0, vUv);
    vec4 mapTexel1 = texture2D(uSampler1, vUv);

    vec3 color = mix(mapTexel0.rgb, mapTexel1.rgb, threshold);

    gl_FragColor = vec4(color, 1.);
}
`;

$: t = transitions[$transition];
$: fragmentShader = t ? t.fragmentShader : defaultFragmentShader;
$: {
    if (output) {
        output.fragmentShader = fragmentShader;
    }
}

onMount(() => {
    output = fragment({
        canvas,
        shader: fragmentShader,
        uniforms,
    });

    uniforms.uSampler0.value = new Texture(output.gl);
    uniforms.uSampler1.value = new Texture(output.gl);

    assignTextures();
    resize();
    render();

    currentRendering.subscribe(() => {
        resize();
    });

    _mounted = true;
});

onDestroy(() => {
    cancelAnimationFrame(_raf);

    output.destroy();
    output = null;
});

function assignTextures([monitorID0, monitorID1] = $multisampling) {
    if (!output) return;
    
    uniforms.uSampler0.value.image = $monitors.find((monitor) => monitor.id === monitorID0).canvas;
    uniforms.uSampler1.value.image = $monitors.find((monitor) => monitor.id === monitorID1).canvas;
}

multisampling.subscribe(assignTextures);

function render() {
    uniforms.threshold.value = $threshold;

    if (!paused) {
        uniforms.uSampler0.value.needsUpdate = true;
        uniforms.uSampler1.value.needsUpdate = true;

        output.render();
    }

    _raf = requestAnimationFrame(render);
}

function resize() {
    if (!output) return;

    const { width, height, pixelRatio } = $currentRendering;

    output.resize({
        width,
        height,
        pixelRatio,
    })
}

</script>

<div class="output-renderer">
    <div class="canvas-container" style="max-width: {$currentRendering.width}px;">
        <canvas bind:this={canvas}></canvas>
    </div>
</div>

<style>
.output-renderer {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;

    background-color: var(--background-color, var(--color-lightblack));
}

.output-renderer :global(canvas) {
    max-width: 100%;
    max-height: 100%;
    background: black;

    width: auto !important;
    height: auto !important;
}

.canvas-container {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    max-height: 100%;
}
</style>
