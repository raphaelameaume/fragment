export function loadImage(url, { id = url } = {}) {
    const image = new Image();

    return new Promise((resolve, reject) => {
        function onLoad() {
            image.removeEventListener('load', onLoad);
            resolve(image);
        }

        function onError(error) {
            image.removeEventListener('load', onLoad);
            image.removeEventListener('error', onError);
            reject(error);
        }

        image.addEventListener('load', onLoad);
        image.addEventListener('error', onError);

        image.src = url;
    });
};
