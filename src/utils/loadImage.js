import noop from "./noop.js";

async function loadImage(src, onLoad = noop) {
    let response = await fetch(src);
    let blob = await response.blob();
    let dataURL = URL.createObjectURL(blob);

    let image = new Image();
    image.addEventListener('load', () => {
        onLoad(image);
    });
    image.src = dataURL;
}

export default loadImage;