const cache = new Map();

function getFileExtension(path) {
    return path.match(/[^\\/]\.([^.\\/]+)$/);
}

function getLoader(extension) {
    if (["jpeg", "jpg", "gif", "png", "webp"].includes(extension)) {
        return loadImage;
    }

    return () => {};
}

export function load(url, options = { id: url }) {
    const extension = getFileExtension(url);
    const loader = options.loader || getLoader(extension);

    return loader(url, options);
};


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
