import type { UserConfig } from 'vite';

export interface Config {
	typescript?: boolean;
	outDir?: string;
	emptyOutDir?: boolean;
	base?: string;
	prompts?: boolean;
	exportDir?: string;
	port?: number;
	open?: boolean;
	vite?: UserConfig;
}
