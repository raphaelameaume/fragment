import type { UserConfig } from 'vite';

export interface Config {
	typescript?: boolean;
	base?: string;
	outDir?: string;
	emptyOutDir?: boolean;
	exportDir?: string;
	port?: number;
	open?: boolean;
	prompts?: boolean;
	vite?: UserConfig;
}
