export default function importScenes() {
    const scenePath = `@fragment/scenes`;

    return {
        name: 'vite-plugin-import-scenes', // required, will show up in warnings and errors
        resolveId(id, importer) {
            if (id === scenePath) return scenePath;
        },
        load(id, importer) {
            if (id === scenePath) {
                return this.resolve(`./_fragment/generated.js`, importer, { skipSelf: true})
                    .then((result) => result);
            }
        }
    };
}
