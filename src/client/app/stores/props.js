import { writable, get } from "svelte/store";
import { current as sketches } from "./sketches";

export const props = writable({});

sketches.subscribe((sketches) => {
	const $props = get(props);

	Object.keys(sketches).forEach((key) => {
		$props[key] = reconcile(sketches[key].props, $props[key]);
		
	});

	props.set($props);
});

function reconcile(newProps = {}, existingProps = {}) {
	Object.keys(newProps).forEach(propKey => {
		newProps[propKey]._initialValue = newProps[propKey].value;
	});

	if (existingProps) {
		Object.keys(existingProps).forEach((propKey) => {
			let newProp = newProps[propKey];

			if (newProp) {
				let prevProp = existingProps[propKey];
				let overrideValue = 
					typeof prevProp._initialValue === "number" && 
					prevProp._initialValue === newProp._initialValue;

				if (overrideValue) {
					newProp.value = prevProp.value;
				}
			}
		});
	};

	return newProps;
}
