/*
https://github.com/mattdesl/canvas-sketch/blob/24f6bb2bbdfdfd72a698a0b8a0962ad843fb7688/lib/save.js
*/

const supportedEncodings = [
    'image/png',
    'image/jpeg',
    'image/webp'
];

export function exportCanvas (canvas, { encoding = 'image/png', encodingQuality = 0.92 } = {}) {
    if (!supportedEncodings.includes(encoding)) throw new Error(`Invalid canvas encoding ${encoding}`);

    let extension = (encoding.split('/')[1] || '').replace(/jpeg/i, 'jpg');
    if (extension) {
        extension = `.${extension}`.toLowerCase();
    }

    return {
        extension,
        type: encoding,
        dataURL: canvas.toDataURL(encoding, encodingQuality)
    };
}

export async function saveDataURL(dataURL, options) {
    const blob = await createBlobFromDataURL(dataURL);
    await saveBlob(blob, options);
};

function createBlobFromDataURL(dataURL) {
    return new Promise((resolve) => {
        const splitIndex = dataURL.indexOf(',');

        if (splitIndex === -1) {
            resolve(new window.Blob());
            return;
        }

        const base64 = dataURL.slice(splitIndex + 1);
        const byteString = window.atob(base64);
        const type = dataURL.slice(0, splitIndex);
        const mimeMatch = /data:([^;]+)/.exec(type);
        const mime = (mimeMatch ? mimeMatch[1] : '') || undefined;
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        resolve(new window.Blob([ ab ], { type: mime }));
    });
}

let link;

function saveBlob(blob, { filename }) {
    return new Promise((resolve) => {
        if (!link) {
            link = document.createElement('a');
            link.style.visibility = 'hidden';
            link.target = '_blank';
        }
        
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        
        document.body.appendChild(link);
        
        link.onclick = () => {
            link.onclick = () => {};
            setTimeout(() => {
                window.URL.revokeObjectURL(blob);
                if (link.parentElement) link.parentElement.removeChild(link);
                link.removeAttribute('href');
                resolve({ filename, client: false });
            });
        };
        link.click();
    });
}
