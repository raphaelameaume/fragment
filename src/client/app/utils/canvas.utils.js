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

function getFileNameSuffix() {
    const now = new Date();

    const year = now.toLocaleString('default', { year: 'numeric' });
    const month = now.toLocaleString('default', { month: 'numeric' });
    const day = now.toLocaleString('default', { day: 'numeric' });
    const hours = now.toLocaleString('default', { hour: 'numeric' }).split(' ')[0];
    const minutes = now.toLocaleString('default', { minute: 'numeric' });
    const seconds = now.toLocaleString('default', { second: 'numeric' });

    const date = `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;

    return date;
}

export async function screenshotCanvas(canvas, name) {
    const { extension, type, dataURL } = exportCanvas(canvas);

    const prefix = `${name}.`;
    const suffix = getFileNameSuffix();
    const filename = `${prefix}${suffix}${extension}`;

    await saveDataURL(dataURL, { filename });
}

let ffmpeg;

export function recordCanvas(canvas, {
    name = 'output',
    extension = 'mp4',
    framerate = 25,
    duration = Infinity,
    onTick = () => {},
    onComplete = () => {}
} = {}) {
    let time = 0;
    let deltaTime = 0;
    let stopped = false;
    let frameCount = 0;

    if (!ffmpeg) {
        const { createFFmpeg } = FFmpeg;

        ffmpeg = createFFmpeg({ log: false });
    }

    async function onEnd() {
        if (frameCount > 1) {
            console.log(`[fragment] record canvas - compile ${frameCount} frames...`);

            const filename = `${name}.${getFileNameSuffix()}.${extension}`;

            await ffmpeg.run(...(`-r 60 -i frame_%04d.png -vcodec libx264 -crf 15 -pix_fmt yuv420p output.${extension}`.split(' ')));
            const data = ffmpeg.FS('readFile', `output.${extension}`);
            const url = URL.createObjectURL(new Blob([data.buffer], { type: `video/${extension}` }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}`;
            a.click();
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
        tick();
    });

    return {
        stop: () => {
            stopped = true;
        }
    }
};

export function createGLRenderer({
    canvas = document.createElement('canvas'),
    antialias = false,
    alpha = false,
    depth = false,
    stencil = false,
    premultipliedAlpha = false,
    pixelRatio = window.devicePixelRatio,
    webgl = 2,
}) {
    let attributes = {
        depth,
        stencil,
        antialias,
        alpha,
        premultipliedAlpha,
    };

    let gl;

    if (webgl === 2) gl = canvas.getContext('webgl2', attributes);
    if (!gl) {
        gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
    }

    let state = {
        activeTextureUnit: 0,
        textureUnits: [],
        flipY: false,
        viewport: { width: 0, height: 0 },
        pixelRatio,
        width: 0,
        height: 0,
    };
    gl.state = state;

    function render({
        geometry,
        program,
        primitiveType = gl.TRIANGLES,
        offset = 0,
        count = 3
    }) {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program.program);

        for (let attributeName in program.attributesLocations) {
            let location = program.attributesLocations[attributeName];
            let buffer = geometry.buffers[attributeName];

            gl.enableVertexAttribArray(location);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            const size = 2; // 2 components per iteration
            const type = gl.FLOAT; // the data is 32bit floats
            const normalize = false; // don't normalize the data
            const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
            const bufferOffset = 0; // start at the beginning of the buffer
            gl.vertexAttribPointer(
                location,
                size,
                type,
                normalize,
                stride,
                bufferOffset
            );
        }

        let textureUnit = -1;

        for (let uniformName in program.uniforms) {
            let location = program.uniformsLocations[uniformName];
            if (location) {
                let uniform = program.uniforms[uniformName];

                if (uniform.type === 'float') {
                    gl.uniform1f(location, uniform.value);
                } else if (uniform.type === 'vec2') {
                    gl.uniform2f(location, uniform.value[0], uniform.value[1]);
                } else if (uniform.type === 'vec3') {
                    gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
                } else if (uniform.type === 'vec4') {
                    gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
                } else if (uniform.type === 'sampler2D') {
                    if (uniform.value) {
                        textureUnit = textureUnit + 1;
                        uniform.value.update(textureUnit);
    
                        gl.uniform1i(location, textureUnit);
                    }
                }
            }
        }

        gl.drawArrays(primitiveType, offset, count);
    }

    function setPixelRatio(pixelRatio) {
        if (state.pixelRatio !== pixelRatio) {
            state.pixelRatio = pixelRatio;
        }

        setSize({ width: state.width, height: state.height });
    }

    function setSize({ width, height }) {
        state.width = width;
        state.height = height;

        canvas.width = state.width * state.pixelRatio;
        canvas.height = state.height * state.pixelRatio;

        setViewport({ width, height });
    }

    function setViewport({ width, height }) {
        let w = Math.floor(width * state.pixelRatio);
        let h = Math.floor(height * state.pixelRatio);

        if (state.viewport.width !== w || state.viewport.height !== h) {
            gl.viewport(0, 0, w, h);

            state.viewport.width = w;
            state.viewport.height = h;
        }
    }

    function destroy() {
        let extension = gl.getExtension('WEBGL_lose_context');

        if (extension) {
            extension.loseContext();
        }
    }

    const renderer = {
        canvas,
        pixelRatio,
        gl,
        render,
        setSize,
        setPixelRatio,
        destroy,
    };

    return renderer;
}


const emptyPixel = new Uint8Array([0, 0, 0, 0]);

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

let TEXTURE_ID = 0;

export function createGLTexture(
    gl,
    {
        image,
        name = '',
        target = gl.TEXTURE_2D,
        type = gl.UNSIGNED_BYTE,
        wrapS = gl.CLAMP_TO_EDGE,
        wrapT = gl.CLAMP_TO_EDGE,
        generateMipmaps = true,
        format = gl.RGBA,
        internalFormat = format,
        minFilter = generateMipmaps ? gl.NEAREST_MIPMAP_LINEAR : gl.LINEAR,
        magFilter = gl.LINEAR,
        // premultiplyAlpha = false,
        // unpackAlignment = 4,
        flipY = target === gl.TEXTURE_2D ? true : false,
        // width = image ? image.width : null,
        // height = image ? image.height : null
    } = {}
) {
    let glTexture = gl.createTexture();
    let id = TEXTURE_ID++;

    function bind() {
        if (gl.state.textureUnits[gl.state.activeTextureUnit] === id) return;
        gl.bindTexture(target, glTexture);
        gl.state.textureUnits[gl.state.activeTextureUnit] = id;

        // console.log(`Texture ${texture.name}:: bind`, id, 'to', gl.state.activeTextureUnit);
    }

    function update(textureUnit = 0) {
        if (texture.needsUpdate || gl.state.textureUnits[textureUnit] !== id) {
            if (gl.state.activeTextureUnit !== textureUnit) {
                gl.state.activeTextureUnit = textureUnit;
                gl.activeTexture(gl.TEXTURE0 + textureUnit);
            }

            bind();
        }

        if (!texture.needsUpdate) return;
        
        texture.needsUpdate = false;

        if (texture.flipY !== gl.state.flipY) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
            gl.state.flipY = texture.flipY;
        }

        if (texture.image && generateMipmaps) {
            if (!isPowerOf2(texture.image.width) || !isPowerOf2(texture.image.height)) {
                generateMipmaps = false;

                texture.wrapS = texture.wrapT = gl.CLAMP_TO_EDGE;
                texture.minFilter = gl.LINEAR;
            }
        }

        gl.texParameteri(target, gl.TEXTURE_WRAP_S, texture.wrapS);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, texture.wrapT);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, texture.minFilter);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, texture.magFilter);

        if (texture.image) {
            gl.texImage2D(target, 0, internalFormat, format, type, texture.image);
            
            if (generateMipmaps) {
                gl.generateMipmap(target);
            }
        } else {
            gl.texImage2D(
                target,
                0,
                gl.RGBA,
                1,
                1,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                emptyPixel
            );
        }
    }

    const texture = {
        name,
        id,
        image,
        flipY,
        needsUpdate: true,
        wrapS,
        wrapT,
        minFilter,
        magFilter,
        texture: glTexture,
        bind,
        update,
    };

    return texture;
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

let PROGRAM_ID = 0;

export function createProgram(gl, { vertex, fragment, uniforms = {} }) {
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
    let glProgram = gl.createProgram();
    let id = PROGRAM_ID++;

    gl.attachShader(glProgram, vertexShader);
    gl.attachShader(glProgram, fragmentShader);
    gl.linkProgram(glProgram);

    let programLog = gl.getProgramInfoLog(glProgram);
    let vertexLog = gl.getShaderInfoLog(vertexShader);
    let fragmentLog = gl.getShaderInfoLog(fragmentShader);

    if (gl.getProgramParameter(glProgram, gl.LINK_STATUS) === false) {
        console.log('error in program');
        console.log(vertexLog);
        console.log(fragmentLog);
    } else if (programLog !== '') {
        console.warn('Warning : createProgram', programLog);
    }

    let success = gl.getProgramParameter(glProgram, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(glProgram));
        gl.deleteProgram(glProgram);
    }

    let uniformsLocations = Object.keys(uniforms).reduce((all, name) => {
        all[name] = gl.getUniformLocation(glProgram, name);

        return all;
    }, {});

    let attributesCount = gl.getProgramParameter(glProgram, gl.ACTIVE_ATTRIBUTES);
    let attributesLocations = {};

    for (let aIndex = 0; aIndex < attributesCount; aIndex++) {
        let attribute = gl.getActiveAttrib(glProgram, aIndex);
        let location = gl.getAttribLocation(glProgram, attribute.name);
        attributesLocations[attribute.name] = location;
    }

    const program = {
        program: glProgram,
        uniforms,
        attributesLocations,
        uniformsLocations,
        fragmentShader: fragment,
        vertexShader: vertex,
        id,
    };

    return program;
}

export function createGeometry(gl, { attributes }) {
    let buffers = Object.keys(attributes).reduce((all, name) => {
        let buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(attributes[name].data),
            gl.STATIC_DRAW
        );

        all[name] = buffer;

        return all;
    }, {});

    const geometry = {
        buffers,
        attributes,
    };

    return geometry;
}
