export const props = $state({});

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
	Object.keys(props[sketchKey]).forEach((propKey) => {
		const prop = sketchProps[propKey];
		resetProp(prop);

		if (typeof prop.onChange === 'function') {
			prop.onChange(prop, params);
		}
	});
}

export function reconcile(newProps = {}, prevProps = {}) {
	const props = Object.assign({}, newProps);

	Object.keys(props).forEach((propKey) => {
		let newProp = props[propKey];

		// if (Array.isArray(newProp.value)) {
		// 	newProp.__initialValue = [...newProp.value];
		// } else if (typeof newProp.value === 'object') {
		// 	newProp.__initialValue = structuredClone(newProp.value);
		// } else {
		// 	newProp.__initialValue = newProp.value;
		// }

		// if (!newProp.params) {
		// 	newProp.params = {};
		// }
	});

	// if (prevProps) {
	// 	Object.keys(prevProps).forEach((propKey) => {
	// 		let prevProp = prevProps[propKey];
	// 		let newProp = newProps[propKey];

	// 		if (newProp) {
	// 			if (newProp.__initialValue === prevProp.__initialValue) {
	// 				newProp.value = prevProp.value;
	// 			}

	// 			if (prevProp.params) {
	// 				// reconcile locked VectorInput from UI
	// 				if (prevProp.params.locked !== undefined) {
	// 					newProp.params.locked = prevProp.params.locked;
	// 				}
	// 			}
	// 		}
	// 	});
	// }

	return props;
}

/**
 * Update prop value based on sketch key and prop key
 * @param {string} sketchKey
 * @param {string} propKey
 * @param {any} newValue
 */
export function updateProp(sketchKey, propKey, newValue, params = {}) {
	const prop = props[sketchKey][propKey];

	if (prop) {
		prop.value = newValue;
		if (typeof prop.onChange === 'function') {
			prop.onChange(prop, params);
		}
	}
}
