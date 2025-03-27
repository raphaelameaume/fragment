import type { Props } from './props';

declare module '@fragment/helpers' {
	function reactiveProps(props?: Props): Props;
}
