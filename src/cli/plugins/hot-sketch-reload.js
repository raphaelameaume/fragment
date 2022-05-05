import path from "path";
import log from "../log.js";

export default function hotSketchReload({ cwd }) {
    return {
        name: 'hot-sketch-reload',
        handleHotUpdate: async ({ server, modules, file, read }) => {
			if (file.includes(cwd)) {
				const filepath = path.relative(cwd, file);
                console.log(`${log.prefix} hot updated: ${filepath}`);
			
				server.ws.send({
					type: 'custom',
					event: 'sketch-update',
					data: {
						file,
						filepath,
						cwd,
					}
				});

			}

			return modules;
        },
        // transform: (src, id) => {
        //     if (fileRegex.test(id)) {
        //         let source = glslify(src);
        //         source = addShaderFilepath(source, id);

        //         return {
        //             code: `export default ${JSON.stringify(source)}`,
        //             map: null // provide source map if available
        //         }
        //     }
        // }
    };
}
