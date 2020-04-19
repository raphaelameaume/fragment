import Fragment, { THREERenderer } from "./build/bundle.js";
import * as stages from "./stages/index.js";

function init() {
    Fragment({
        renderer: THREERenderer(window.THREE, { width: 1280 * 1, height: 720 * 1, dpr: 1 }),
        stages,
    });
}

if (document.body) {
    init();
} else {
    window.addEventListener('DOMContentLoaded', () => {
        init();
    });
}