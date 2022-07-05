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

    let dataURL = canvas.toDataURL(encoding, encodingQuality); 

    return {
        extension,
        type: encoding,
        dataURL
    };
}
