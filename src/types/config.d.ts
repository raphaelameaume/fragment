import type { UserConfig } from 'vite';

export interface Config {
	typescript?: boolean;
	exportDir?: string;
	server?: {
		port?: number;
		open?: boolean;
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
