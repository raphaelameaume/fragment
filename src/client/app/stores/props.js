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

function resetProp(prop) {
	function copyProperties(source, target) {
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				// Check if the property is an object (including nested objects)
				if (typeof source[key] === 'object' && source[key] !== null) {
					// If the property is an object, recursively copy its properties
					target[key] = target[key] || {};
					copyProperties(source[key], target[key]);
				} else {
					// If the property is not an object, copy its value
					target[key] = source[key];
				}
			}
		}
	}

	if (Array.isArray(prop.value)) {
		for (let i = 0; i < prop.__initialValue.length; i++) {
			prop.value[i] = prop.__initialValue[i];
		}
	} else if (typeof prop.value === 'object') {
		copyProperties(prop.__initialValue, prop.value);
	} else {
		prop.value = prop.__initialValue;
	}
}

export function resetProps(sketchKey, params = {}) {
	props.update((all) => {
		const sketchProps = all[sketchKey];

		Object.keys(sketchProps).forEach((propKey) => {
			const prop = sketchProps[propKey];
			resetProp(prop);

			prop.onChange?.(prop, params);
		});

		return all;
	});
}

export function reconcile(newProps = {}, prevProps = {}) {
	Object.keys(newProps).forEach((propKey) => {
		let newProp = newProps[propKey];

		if (Array.isArray(newProp.value)) {
			newProp.__initialValue = [...newProp.value];
		} else if (typeof newProp.value === 'object') {
			newProp.__initialValue = structuredClone(newProp.value);
		} else {
			newProp.__initialValue = newProp.value;
		}

		if (!newProp.params) {
			newProp.params = {};
		}
	});

	if (prevProps) {
		Object.keys(prevProps).forEach((propKey) => {
			let prevProp = prevProps[propKey];
			let newProp = newProps[propKey];

			if (newProp) {
				if (newProp.__initialValue === prevProp.__initialValue) {
					newProp.value = prevProp.value;
				}

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
