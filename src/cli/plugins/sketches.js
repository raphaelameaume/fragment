import path from 'node:path';

export default function sketches({ cwd, entries }) {
	const virtualModuleId = 'virtual:sketches';
	const resolvedVirtualModuleId = '\0' + virtualModuleId;

	return {
		name: 'fragment-plugin-sketches',
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				return `
				export const sketches = {
    ${entries
		.map((entry) => {
			const entryPath = path.join(cwd, entry);

			return `"${entry}": () => import("${entryPath}")`;
		})
		.join(',')}
};

export const onSketchReload = (fn) => {
    if (import.meta.hot) {
        import.meta.hot.data.onSketchChange = fn;
    }
};

if (import.meta.hot) {
    import.meta.hot.accept((m) => {
        if (typeof import.meta.hot.data.onSketchChange === "function") {
            import.meta.hot.data.onSketchChange(m);
        }
    });
}
				`;
			}
		},
	};
}
