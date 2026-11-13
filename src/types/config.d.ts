import { UserConfig } from 'vite';

export interface Config {
	vite?: UserConfig;
	[key: string]: any;
}
