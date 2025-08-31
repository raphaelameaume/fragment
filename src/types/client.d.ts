declare const __CWD__: string | undefined;
declare const __FRAGMENT_PORT__: string | number | undefined;
declare const __START_TIME__: string | number | undefined;
declare const __SEED__: string | number | undefined;
declare const __BUILD__: boolean | undefined;

declare const __THREE_RENDERER__: string | undefined;
declare const __FRAGMENT_RENDERER__: string | undefined;
declare const __P5_RENDERER__: string | undefined;
declare const __P5_WEBGL_RENDERER__: string | undefined;
declare const __2D_RENDERER__: string | undefined;

declare module '*.glsl' {
	const value: string;
	export default value;
}

declare module '*.vs' {
	const value: string;
	export default value;
}

declare module '*.vert' {
	const value: string;
	export default value;
}

declare module '*.fs' {
	const value: string;
	export default value;
}

declare module '*.frag' {
	const value: string;
	export default value;
}
