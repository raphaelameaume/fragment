import fs from "fs/promises";
import path from "path";
import { watch } from "chokidar";
import log from "./log.js";
import { start as startViteServer } from "./server.js";
import { start as startWebSocketServer } from "./ws.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const timestamp = Date.now();

export const run = async (entry, options) => {
    let wsServer;

    function exit() {
        process.off('SIGTERM', exit);

        if (wsServer) {
            wsServer.close();
        }
    }

    process.once('SIGTERM', exit);

    try {
        const entries = await createEntries(entry, options);

        if (entries.length > 0) {
            const filepaths = await generateFiles(entries, options);

            wsServer = await startWebSocketServer();

            await startViteServer({
                options,
                timestamp,
                filepaths,
                entries,
                fragment: {
                    server: wsServer,
                }
            });
        }
    } catch(error) {
        console.log(error);
    }
};

async function createEntries(entry, options) {
    if (entry === undefined) {
        log.error(`Missing argument.`)
        console.log(" Use --new flag to let fragment create the file.");
        return;
    }
    
    const entries = [];
    const shouldCreateFile = options.new;

    async function createEntryFile(entryPath) {
        const templates = {
            "2d": [
                "./templates/2d.js"
            ],
            "three/orthographic": [
                "./templates/three-orthographic.js"
            ],
            "three/fragment": [
                "./templates/three-fragment.js",
                "./templates/fragment.fs"
            ],
            "three/perspective": [
                "./templates/three-perspective.js"
            ],
            "ogl/orthographic": [
                "./templates/ogl-orthographic.js"
            ],
            "ogl/perspective": [
                "./templates/ogl-perspective.js"
            ],
            "default": [
                "./templates/default.js"
            ],
        };

        const createFromTemplate = typeof options.template === "string";
        const templateFiles = createFromTemplate ? templates[options.template] : templates.default;

        if (!templateFiles) {
            log.error(`Wrong argument value.`);
            console.log(`Template ${options.template} doesn't exist.\nPossible values are:`);
            Object.keys(templates).forEach((key) => {
                console.log(key);
            });
            return;
        }

        const entryName = path.basename(entryPath, path.extname(entryPath));

        for (let i = 0; i < templateFiles.length; i++) {
            const filepath = path.join(__dirname, templateFiles[i]);
            const ext = path.extname(filepath);
            let fileContent = (await fs.readFile(filepath)).toString();

            const destPath = i === 0 ? entryPath :
                path.join(process.cwd(), `${entryName}${ext}`);
            const destName = path.basename(destPath);

            const filepaths = templateFiles
                .filter((file, index) => index !== i)
                .map((file) => path.basename(file));

            for (let i = 0; i < filepaths.length; i++) {
                fileContent = fileContent.replace(new RegExp(filepaths[i], 'g'), `${entryName}${path.extname(filepaths[i])}`);
            }

            await fs.writeFile(destPath, Buffer.from(fileContent));
            
            console.log(`${log.prefix} Created ${path.relative(process.cwd(), destPath)} on disk.`);
        }
    }

    const entryPath = path.join(process.cwd(), entry);

    try {
        const stats = await fs.lstat(entryPath);

        if (stats.isDirectory()) {
            const files = await fs.readdir(entryPath);
            const sketchFiles = files.filter((file) => path.extname(file) === ".js");

            if (sketchFiles.length === 0) {
                log.error(`Folder doesn't contain any sketch files.`);
                console.log("Use --new flag to start working on a sketch.");
                return;
            }

            entries.push(...sketchFiles.map((sketchFile) => path.relative(process.cwd(), sketchFile)));
        } else if (stats.isFile()) {
            if (shouldCreateFile) {
                log.warning(`Ignored argument:`);
                console.log(`${entry} already exists.`);
            }

            entries.push(path.relative(process.cwd(), entryPath));
        }
    } catch(error) {
        if (error.code === "ENOENT") {
            if (shouldCreateFile) {
                await createEntryFile(entryPath);
            } else {
                log.error(`Missing file: ${entry} doesn't exist.`)
                console.log("Use --new flag to create the file automatically");
            }
        }
    }

    

    return entries;
}

async function generateFiles(entries, options) {
    const dir = "/node_modules/.fragment";
    const dirpath = path.join(process.cwd(), dir);
    const filename = `sketches.js`;

    // create directory and don't throw error if it already exists
    try {
		await fs.mkdir(dirpath, { recursive: true });
	} catch (e) {
		if (e.code !== 'EEXIST') {
            throw e;
        }
	}

    // generate sketch index file
    const code = `
// This file is generated by Fragment. Do not edit it.

${entries.map((entry, index) => {
return `import * as sketch${index} from "../../${entry}";`;
}).join("\n")}

export const sketches = {
    ${entries.map((entry, index) => {
        return `"${entry}": sketch${index}`
    }).join(',')
    }
};`;

    const filepath = path.join(dirpath, filename);

    await fs.writeFile(filepath, code);

    console.log(`${log.prefix} Generated ${dir}/${filename} from entries:`);
    entries.forEach(entry => console.log(entry));

    // generate props
    const filepathProps = path.join(dirpath, 'props.js');

    await fs.writeFile(filepathProps, `
// This file is generated by Fragment. Do not edit it.

export let rendering = "${options.rendering}";
export let sketchesCount = ${entries.length};
export let sketchFiles = [${entries.map((entry, index) => {
        return `"${entry}"`;
    }).join(',')}];
`);

    // generate renderer file
    const renderings = {
        "2d": "../client/app/renderers/2DRenderer.js",
        "three-webgl": "../client/app/renderers/THREERenderer.js"
    };

    const rendering = renderings[options.rendering];

    if (!rendering) {
        log.error(`${options.rendering} is not a valid value.`);
        Object.keys(renderings).forEach(rendering => console.log(rendering));
        return;
    }

    const rendererPath = path.join(__dirname, rendering);
    const rendererContent = await fs.readFile(rendererPath);
    const filepathRenderer = path.join(dirpath, 'renderer.js');

    await fs.writeFile(filepathRenderer, rendererContent);

    const watcher = watch(rendererPath);
    watcher.on('change', async () => {
        const content = await fs.readFile(rendererPath);
        await fs.writeFile(filepathRenderer, content);
    });

    return [filepath, filepathProps, filepathRenderer];
}
