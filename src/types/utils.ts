import { Props } from './props';

/**
 * Declare props with full type inference support
 *
 * @param {Props} props
 * @returns {Props}
 */
export function defineProps<P extends Props>(props: P): P {
	return props;
}
