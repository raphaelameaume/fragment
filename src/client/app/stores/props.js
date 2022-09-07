import { writable, get } from "svelte/store";
import { sketches } from "./sketches";

export const props = writable({});

sketches.subscribe((sketches) => {
	props.update((currentProps) => {
		Object.keys(sketches).forEach((key) => {
			const sketch = sketches[key];

			if (sketch) { // sketch can be undefined if failed to load
				currentProps[key] = reconcile(sketch.props, currentProps[key]);
			}
		});

		return currentProps;
	});
});

function reconcile(newProps = {}, prevProps = {}) {
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
