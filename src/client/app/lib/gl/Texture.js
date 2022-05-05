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
		this.type = type;
		this.wrapS = wrapS;
		this.wrapT = wrapT;
		this.generateMipmaps = generateMipmaps;
		this.format = format;
		this.internalFormat = internalFormat;
		this.minFilter = minFilter;
		this.magFilter = magFilter;
		this.flipY = flipY;

		this.glTexture = this.gl.createTexture();
		this.id = TEXTURE_ID++;
	}

    bind() {
        if (this.gl.state.textureUnits[this.gl.state.activeTextureUnit] === this.id) return;

        this.gl.bindTexture(target, glTexture);
        this.gl.state.textureUnits[this.gl.state.activeTextureUnit] = this.id;
    }

    update(textureUnit = 0) {
        if (this.needsUpdate || this.gl.state.textureUnits[textureUnit] !== id) {
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

        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, texture.wrapS);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, texture.wrapT);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, texture.minFilter);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, texture.magFilter);

        if (this.image) {
            this.gl.texImage2D(this.target, 0, internalFormat, format, type, texture.image);
            
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
}

export default Texture;
