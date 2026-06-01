import type { UserConfig } from 'vite';

export type TemplateName =
	| 'blank'
	| 'default'
	| 'fragment-gl'
	| 'p5'
	| 'p5-gl'
	| 'three-fragment'
	| 'three-orthographic'
	| 'three-perspective';

export interface Config {
	port?: number;
	open?: boolean;
	exportDir?: string;
	create?: {
		template?: TemplateName;
		typescript?: boolean;
	};
	build?: {
		outDir?: string;
		emptyOutDir?: boolean;
		base?: string;
		prompts?: boolean;
	};
	preview?: {
		port?: number;
		open?: boolean;
	};
	vite?: UserConfig;
}
