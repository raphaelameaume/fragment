import { sketches } from './sketches';
import { getStore } from './utils';

export const props = getStore('props', {});

sketches.subscribe((sketches) => {
	props.update((currentProps) => {
		Object.keys(sketches).forEach((key) => {
			const sketch = sketches[key];

			if (sketch) {
				// sketch can be undefined if failed to load
				currentProps[key] = reconcile(sketch.props, currentProps[key]);
			}
		});

		return currentProps;
	});
});

export function reconcile(newProps = {}, prevProps = {}) {
	Object.keys(newProps).forEach((propKey) => {
		let newProp = newProps[propKey];

		if (!newProp.params) {
			newProp.params = {};
		}
	});

	if (prevProps) {
		Object.keys(prevProps).forEach((propKey) => {
			let prevProp = prevProps[propKey];
			let newProp = newProps[propKey];

			if (newProp) {
				if (prevProp.params) {
					// reconcile locked VectorInput from UI
					if (prevProp.params.locked !== undefined) {
						newProp.params.locked = prevProp.params.locked;
					}
				}
			}
		});
	}

	return newProps;
}

/**
 * Update prop value based on sketch key and prop key
 * @param {string} sketchKey
 * @param {string} propKey
 * @param {any} newValue
 */
export function updateProp(sketchKey, propKey, newValue, params = {}) {
	props.update((currentProps) => {
		const prop = currentProps[sketchKey][propKey];

		if (prop) {
			prop.value = newValue;

			if (typeof prop.onChange === 'function') {
				prop.onChange(prop, params);
			}
		}

		return currentProps;
	});
}
