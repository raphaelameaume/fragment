declare module '@fragment/lib/gl' {
	type Gl = WebGLRenderingContext | WebGL2RenderingContext;

	type UniformValue = number | number[] | Texture | null;
	type Uniform = { type?: string; value?: UniformValue };
	type Uniforms = Record<string, Uniform>;

	type Attributes = Record<string, { data: number[] }>;

	class Geometry {
		constructor(gl: Gl, attributes?: Attributes);
		gl: Gl;
		attributes: Attributes | null;
		buffers: Record<string, WebGLBuffer> | null;
	}

	class Texture {
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
		resize: (width: number, height: number) => void;
		update(textureUnit?: number): void;
		destroy(): void;
	}

	class Program {
		constructor(
			gl: Gl,
			params?: {
				vertex?: string;
				fragment?: string;
				uniforms?: Uniforms;
			},
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

	class Renderer {
		constructor(params?: {
			canvas?: HTMLCanvasElement;
			antialias?: boolean;
			alpha?: boolean;
			depth?: boolean;
			stencil?: boolean;
			premultipliedAlpha?: boolean;
			pixelRatio?: number;
			webgl?: 1 | 2;
		});
		gl: Gl;
		canvas: HTMLCanvasElement;
		render(params: {
			geometry: Geometry;
			program: Program;
			primitiveType?: GLenum;
			offset?: number;
			count?: number;
		}): void;
		setPixelRatio(pixelRatio?: number): void;
		setSize(params?: { width?: number; height?: number }): void;
		setViewport(params?: { width?: number; height?: number }): void;
		destroy(): void;
	}

	class FBO {
		constructor(
			renderer: Renderer,
			params?: {
				name?: string;
				vertex?: string;
				fragment?: string;
				uniforms?: Uniforms;
				width?: number;
				height?: number;
				type?: number;
				wrapS?: number;
				wrapT?: number;
				generateMipmaps?: boolean;
				format?: number;
				internalFormat?: number;
				minFilter?: number;
				magFilter?: number;
			},
		);
		gl: Gl;
		renderer: Renderer;
		geometry: Geometry;
		program: Program;
		texture: Texture;
		framebuffer: WebGLFramebuffer | null;
		width: number;
		height: number;
		resize: (width: number, height: number) => void;
		render: () => void;
		destroy: () => void;
	}

	interface Frag {
		gl: Gl;
		renderer: Renderer;
		program: Program;
		texture: (params?: {}) => Texture;
		shader: string;
		fragmentShader: string;
		vertexShader: string;
		uniforms: Uniforms;
		resize: (params?: {
			width?: number;
			height?: number;
			pixelRatio?: number;
		}) => void;
		render: () => void;
		destroy: () => void;
	}

	function fragment(params?: {
		canvas?: HTMLCanvasElement;
		shader?: string;
		uniforms?: Uniforms;
	}): Frag;
}
