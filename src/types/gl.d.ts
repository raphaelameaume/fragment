import type { fragment } from '../client/app/lib/gl';

type Gl = WebGLRenderingContext | WebGL2RenderingContext | null;

type UniformValue = number | number[] | Texture;
type Uniform = { type?: string; value?: UniformValue };
type Uniforms = Record<string, Uniform>;

type Attributes = Record<string, { data: number[] }>;

export class Geometry {
	constructor(gl: Gl, attributes?: Attributes);
	gl: Gl;
	attributes: Attributes | null;
	buffers: Record<string, WebGLBuffer> | null;
}

export class Texture {
	constructor(
		gl: Gl,
		params?: {
			image?: TexImageSource | null;
			name?: string;
			target?: number;
			type?: number;
			wrapS?: number;
			wrapT?: number;
			generateMipmaps?: boolean;
			format?: number;
			internalFormat?: number;
			minFilter?: number;
			magFilter?: number;
			flipY?: boolean;
		},
	);
	id: number;
	gl: Gl;
	image: TexImageSource | null;
	name: string;
	target: number;
	type: number;
	wrapS: number;
	wrapT: number;
	generateMipmaps: boolean;
	format: number;
	internalFormat: number;
	minFilter: number;
	magFilter: number;
	flipY: boolean;
	needsUpdate: boolean;
	glTexture: WebGLTexture | null;
	bind(): void;
	update(textureUnit?: number): void;
	destroy(): void;
}

export class Program {
	constructor(
		gl: Gl,
		params: { vertex: string; fragment: string; uniforms: Uniforms },
	);
	id: number;
	gl: Gl;
	vertexShader: string;
	fragmentShader: string;
	uniforms: Uniforms;
	needsUpdate: boolean;
	attributesLocations: Record<
		string,
		ReturnType<WebGLRenderingContext['getAttribLocation']>
	>;
	uniformsLocations: Record<
		string,
		ReturnType<WebGLRenderingContext['getUniformLocation']>
	>;
	compile(): void;
}

export class Renderer {
	constructor(params: {
		canvas?: HTMLCanvasElement;
		antialias?: boolean;
		alpha?: boolean;
		depth?: boolean;
		stencil?: boolean;
		premultipliedAlpha?: boolean;
		pixelRatio?: number;
		webgl?: 1 | 2;
	});
	gl: WebGLRenderingContext;
	canvas: HTMLCanvasElement;
	render(params: {
		geometry: Geometry;
		program: Programy;
		primitiveType: GLenum;
		offset?: number;
		count?: number;
	}): void;
	setPixelRatio(pixelRatio?: number): void;
	setSize(params?: { width?: number; height?: number }): void;
	setViewport(params?: { width?: number; height?: number }): void;
	destroy(): void;
}

export type Frag = ReturnType<typeof fragment> & {
	shader: string;
	fragmentShader: string;
	vertexShader: string;
	uniforms: Uniforms;
};
