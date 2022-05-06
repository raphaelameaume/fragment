import { isPowerOf2 } from "./utils";

const emptyPixel = new Uint8Array([0, 0, 0, 0]);

let TEXTURE_ID = 0;

class Texture {
	constructor(gl, {
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
	} = {}) {
		this.gl = gl;
		this.image = image;
		this.name = name;
		this.target = target;
		this.type = type;
		this.wrapS = wrapS;
		this.wrapT = wrapT;
		this.generateMipmaps = generateMipmaps;
		this.format = format;
		this.internalFormat = internalFormat;
		this.minFilter = minFilter;
		this.magFilter = magFilter;
		this.flipY = flipY;
		this.needsUpdate = true;

		this.glTexture = this.gl.createTexture();
		this.id = TEXTURE_ID++;
	}

    bind() {
        if (this.gl.state.textureUnits[this.gl.state.activeTextureUnit] === this.id) return;

        this.gl.bindTexture(this.target, this.glTexture);
        this.gl.state.textureUnits[this.gl.state.activeTextureUnit] = this.id;
    }

    update(textureUnit = 0) {
        if (this.needsUpdate || this.gl.state.textureUnits[textureUnit] !== this.id) {
            if (this.gl.state.activeTextureUnit !== textureUnit) {
                this.gl.state.activeTextureUnit = textureUnit;
                this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
            }

            this.bind();
        }

        if (!this.needsUpdate) return;
        
        this.needsUpdate = false;

        if (this.flipY !== this.gl.state.flipY) {
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
            this.gl.state.flipY = this.flipY;
        }

        if (this.image && this.generateMipmaps) {
            if (!isPowerOf2(this.image.width) || !isPowerOf2(this.image.height)) {
                this.generateMipmaps = false;

                this.wrapS = this.wrapT = this.gl.CLAMP_TO_EDGE;
                this.minFilter = this.gl.LINEAR;
            }
        }

        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.wrapS);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.wrapT);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.minFilter);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.magFilter);

        if (this.image) {
            this.gl.texImage2D(this.target, 0, this.internalFormat, this.format, this.type, this.image);
            
            if (this.generateMipmaps) {
                this.gl.generateMipmap(this.target);
            }
        } else {
            this.gl.texImage2D(
                this.target,
                0,
                this.gl.RGBA,
                1,
                1,
                0,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                emptyPixel
            );
        }
    }

    destroy() {
        this.gl.deleteTexture(this.glTexture);
        this.glTexture = null;
        this.gl = null;
		this.image = null;
    }
}

export default Texture;
