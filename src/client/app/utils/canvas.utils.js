/*
https://github.com/mattdesl/canvas-sketch/blob/24f6bb2bbdfdfd72a698a0b8a0962ad843fb7688/lib/save.js
*/

import { changeDpiDataUrl } from "changedpi";
import { get } from "svelte/store";
import { exports } from "../stores";
import WebMWriter from "webm-writer";
import { VIDEO_FORMATS } from "../stores/exports";
import { downloadBlob } from "./file.utils";

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

export async function saveDataURL(dataURL, options) {
    async function onError(err) {
        if (typeof options.onError === "function") {
            options.onError(err);
            
        }

        console.log(err);

        const blob = await createBlobFromDataURL(dataURL);
        await downloadBlob(blob, options);
    }

    try {
        const body = {
            dataURL,
            ...options,
        };
        const response = await fetch('/save', {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        const { filepath, error } = await response.json();

        if (response.ok && filepath) {
            console.log(`[fragment] Saved ${filepath}`);
        } else {
            onError(error);
        }
    } catch(error) {
        onError(error);
    }
};

export async function createDataURLFromBlob(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onerror = (err) => {
            reject(err);
        };

        reader.onload = (e) => {
            let base64 = e.target.result.split(',')[1];

            resolve(base64);
        };

        reader.readAsDataURL(blob);
    });
}

export async function saveBlob(blob, options) {
    const dataURL = await createDataURLFromBlob(blob);

    return saveDataURL(dataURL, options);
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

function getFilenameParams() {
    const now = new Date();

    const year = now.toLocaleString('default', { year: 'numeric' });
    const month = now.toLocaleString('default', { month: 'numeric' }).padStart(2, `0`);
    const day = now.toLocaleString('default', { day: 'numeric' });
    const hours = now.toLocaleString('default', { hour: 'numeric' }).split(' ')[0];
    const minutes = now.toLocaleString('default', { minute: 'numeric' }).padStart(2, `0`);
    const seconds = now.toLocaleString('default', { second: 'numeric' }).padStart(2, `0`);

    const suffix = `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;

    return {
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        suffix,
    };
}

export const defaultFilenamePattern = ({
    filename,
    suffix,
}) => {
    return `${filename}.${suffix}`;
};

export async function screenshotCanvas(canvas, {
    filename = "",
    pattern = defaultFilenamePattern,
    params = {},
}) {
    const { imageEncoding, quality, pixelsPerInch } = get(exports);
    let { extension, dataURL } = exportCanvas(canvas, {
        encoding: `image/${imageEncoding}`,
        encodingQuality: quality,
    });

    let patternParams = getFilenameParams();
    let name = pattern({ filename, ...params, ...patternParams });

    if (imageEncoding !== "webp" && pixelsPerInch !== 72) {
        dataURL = changeDpiDataUrl(dataURL, exportParams.pixelsPerInch);
    }

    dataURL = dataURL.split(',')[1]; // remove extension

    await saveDataURL(dataURL, {
        filename: `${name}${extension}`,
        onError: () => {
            console.error(`[fragment] Error while saving screenshot.`);
        }
    });
}

let ffmpeg;
let noop = () => {};

function recordCanvasWebM(canvas, {
    filename = 'output',
    framerate = 25,
    duration = Infinity,
    onStart = noop,
    onTick = noop,
    onComplete = noop,
}) {
    let writer = new WebMWriter({
        quality: 0.95,
        frameRate: framerate,
    });

    let time = 0;
    let deltaTime = 0;
    let frameCount = 0;
    let frameTotal = isFinite(duration) ? duration * framerate : Infinity;
    let started = false;
    let stopped = false;

    function start() {
        started = true;

        tick();
    }

    async function onEnd() {
        onComplete();

        let blob = await writer.complete();
        saveBlob(blob, {
            filename: `${filename}.webm`,
            onError: () => {
                console.log(`[fragment] Error while saving record.`);
            }
        });
    }

    function tick() {
        onTick({ time, deltaTime });
        
        writer.addFrame(canvas);

        deltaTime = (1000 / framerate);
        time += deltaTime;
        frameCount++;

        console.log(frameCount, frameTotal, isFinite(frameTotal) && frameCount < frameTotal);

        if (started && !stopped && (!isFinite(frameTotal) || (isFinite(frameTotal) && frameCount < frameTotal))) {
            requestAnimationFrame(tick);
        } else {
            onEnd();
        }
    }

    start();

    return {
        stop: () => {
            stopped = true;
        }
    }
}

export function recordCanvas(canvas, {
    filename = 'output',
    format = 'mp4',
    framerate = 25,
    duration = Infinity,
    pattern = defaultFilenamePattern,
    onStart = () => {},
    onTick = () => {},
    onComplete = () => {}
} = {}) {
    let time = 0;
    let deltaTime = 0;
    let stopped = false;
    let frameCount = 0;

    let patternParams = getFilenameParams();
    let name = pattern({ filename, ...patternParams });

    const options = {
        filename: name,
        framerate,
        duration,
        onStart,
        onTick,
        onComplete,
    };

    let recorder; 

    if (format === VIDEO_FORMATS.WEBM) {
        recorder = recordCanvasWebM(canvas, options);
    } else {
        if (!ffmpeg) {
            const { createFFmpeg } = FFmpeg;

            ffmpeg = createFFmpeg({ log: false });
        }

        async function onEnd() {
            if (frameCount > 1) {
                console.log(`[fragment] record canvas - compile ${frameCount} frames...`);

                const filename = `${name}.${getFileNameSuffix()}.${extension}`;

                await ffmpeg.run(...(`-r ${framerate} -i frame_%04d.png -vcodec libx264 -crf 15 -pix_fmt yuv420p output.${extension}`.split(' ')));
                const data = ffmpeg.FS('readFile', `output.${extension}`);
                const blob = new Blob([data.buffer], { type: `video/${extension}` });

                downloadBlob(blob, { filename });
            } else {
                console.log(`[fragment] record canvas - stopped before rendering started.`);
            }
        }

        function tick() {
            if (stopped) {
                return onEnd();
            }

            onTick({ time, deltaTime });

            deltaTime = (1000 / framerate);
            time += deltaTime;

            canvas.toBlob(async function(blob) {
                const fn = `frame_${frameCount.toString().padStart(4, '0')}.png`;
                ffmpeg.FS('writeFile', fn, new Uint8Array(await blob.arrayBuffer()));

                frameCount++;

                console.log(`[fragment] recording canvas - render frame ${frameCount} - duration ${time}ms`);

                if (frameCount < framerate * duration) {
                    requestAnimationFrame(tick);
                } else {
                    await onEnd();
                    onComplete();
                }
            });
        }

        let promise = Promise.resolve();
        
        if (!ffmpeg.isLoaded()) {
            console.log(`[fragment] loading ffmpeg...`);
            promise = ffmpeg.load().then(() => {
                console.log(`[fragment] loaded ffmpeg`);
            })
        }

        promise.then(() => {
            onStart();
            tick();
        });
    }

    return {
        stop: () => {
            if (recorder) {
                recorder.stop();
            }

            stopped = true;
        }
    }
};
