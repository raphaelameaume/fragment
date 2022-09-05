import { writable, get } from "svelte/store";
import { sketches } from "./sketches";

export const props = writable({});

sketches.subscribe((sketches) => {
	const $props = get(props);

	Object.keys(sketches).forEach((key) => {
		const sketch = sketches[key];

		if (sketch) { // sketch can be undefined if failed to load
			$props[key] = reconcile(sketch.props, $props[key]);
		}
	});

	props.set($props);
});

function reconcile(newProps = {}, prevProps = {}) {
	if (prevProps) {
		Object.keys(prevProps).forEach((propKey) => {
			let prevProp = prevProps[propKey];
			let newProp = newProps[propKey];

			console.log(prevProp);

			if (newProp) {
				if (!newProp.params) {
					newProp.params = {};
				}

				if (prevProp.params) {
					// reconcile locked VectorInput from UI
					if (prevProp.params.locked !== undefined) {
						console.log("reconcile locked param", propKey, prevProp.params.locked);
						newProp.params.locked = prevProp.params.locked;
					}
				}
			}
		});
	}

	return newProps;
}
