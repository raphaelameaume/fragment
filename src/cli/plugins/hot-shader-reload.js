import path from "path";
import glslify from "glslify";

export default function hotShaderReload({ wss }) {
    const fileRegex = /\.(?:frag|vert|glsl|vs|fs)$/
    
    return {
        name: 'hot-shader-reload',
        handleHotUpdate: async ({ file, read }) => {
            if (fileRegex.test(file)) {
                let src = await read();
                let source = glslify(src);

                wss.send({
                    type: 'custom',
                    event: 'shader-update',
                    data: {
                        filepath: file,
                        source
                    },
                });

                return [];
            }
        },
        transform: (src, id) => {
            if (fileRegex.test(id)) {
                let source = glslify(src);

                let keyword = `void`;
                let shaderParts = source.split(keyword);
                let hint = `// <filepath://${id}>`

                source = `
${shaderParts[0]}
${hint}
${keyword}${shaderParts[1]}
                `;

                return {
                    code: `export default ${JSON.stringify(source)}`,
                    map: null // provide source map if available
                }
            }
        }
    };
}
