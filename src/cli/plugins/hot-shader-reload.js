import path from "path";
import glslify from "glslify";

export default function hotShaderReload() {
    const fileRegex = /\.(?:frag|vert|glsl|vs|fs)$/
    
    return {
        name: 'hot-shader-reload',
        transform: (src, id) => {
            if (fileRegex.test(id)) {
                let source = glslify(src);
                return {
                    code: `export default ${JSON.stringify(source)}`,
                    map: null // provide source map if available
                }
            }
        }
    };
}
