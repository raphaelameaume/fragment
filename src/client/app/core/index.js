import { current as currentRendering } from "../stores/rendering";

const items = [];

export function createCanvas({ pixelRatio = 1 } = {}) {
    const canvas = document.createElement("canvas");

    resizeCanvas(canvas, pixelRatio);

    items.push({ canvas, pixelRatio });

    return canvas;
};

export function disposeCanvas(canvas) {
    const index = items.findIndex((item) => item.canvas === canvas);

    items.splice(index, 1);
};

function resizeCanvas(canvas, pixelRatio = 1) {
    canvas.width = $currentRendering.width * pixelRatio;
    canvas.height = $currentRendering.height * pixelRatio;
}

let w, h;

currentRendering.subscribe(({ width, height }) => {
    const needsResize = w !== width || h !== height;

    w = width;
    h = height;

    if (needsResize) {
        items.forEach(({ canvas, pixelRatio }) => {
            resizeCanvas(canvas, pixelRatio);
        });
    }
});
