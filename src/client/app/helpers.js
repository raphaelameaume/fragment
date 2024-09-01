export function reactiveProps(props = {}) {
	console.warn(
		`reactiveProps has been deprecated. Props are now reactive by default.`,
	);
	return props;
}
