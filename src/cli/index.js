import fs from "fs/promises";
import path from "path";
import log from "./log.js";
import { start as startViteServer } from "./server.js";
import { start as startWebSocketServer } from "./ws.js";
import templates from "./templates/index.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = path.join(__dirname, '../client/app');
const timestamp = Date.now();
const allowedExtensions = ['.js', '.ts']

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

            if (!options.build) {
                wsServer = await startWebSocketServer({
                    cwd: process.cwd(),
                });
            }

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
    let shouldCreateFile = options.new;

    async function createEntryFile(entryPath) {
        if (!allowedExtensions.includes(path.extname(entryPath))) {
            throw new Error(`File extension needs to be ${allowedExtensions.join(' or ')}`);
        }

        const createFromTemplate = typeof options.template === "string";
        const templateFiles = createFromTemplate ? templates[options.template] : templates.default;

        if (!templateFiles) {
            throw new Error(`Error: Template ${options.template} doesn't exist.`);
        }

        let entryName = path.basename(entryPath, path.extname(entryPath));

        for (let i = 0; i < templateFiles.length; i++) {
            const filepath = path.join(__dirname, templateFiles[i]);
            const ext = path.extname(filepath);
            const filename = path.basename(filepath, ext);
            let fileContent = (await fs.readFile(filepath)).toString();

            if(filename === 'tsconfig') {
                entryName = filename
                fileContent = fileContent.replace('$BASE_URL', app);
                fileContent = fileContent.replace('$FRAGMENT_ALIAS_PATH', '*');
                fileContent = fileContent.replace('$TYPES_PATH', path.join(app, 'types/client'));
            }

            const destPath = i === 0 ? entryPath :
                path.join(process.cwd(), `${entryName}${ext}`);

            const filepaths = templateFiles
                .filter((file, index) => index !== i)
                .map((file) => path.basename(file));

            for (let i = 0; i < filepaths.length; i++) {
                fileContent = fileContent.replace(new RegExp(filepaths[i], 'g'), `${entryName}${path.extname(filepaths[i])}`);
            }

            try {
                const stats = await fs.lstat(destPath);

                if (stats.isFile()) {
                    log.warning(`Ignored argument: --new. File already exists.`);
                }
            } catch(error) {
                if (error.code === "ENOENT") {
                    await fs.writeFile(destPath, Buffer.from(fileContent));
                    console.log(`${log.prefix} Created ${path.relative(process.cwd(), destPath)} on disk.`);
                } else {
                    throw error;
                }
            }
        }

        shouldCreateFile = false;
    }

    const entryPath = path.join(process.cwd(), entry);

    try {
        if (shouldCreateFile) {
            await createEntryFile(entryPath);
        }

        const stats = await fs.lstat(entryPath);
        
        if (stats.isFile()) {
            entries.push(path.relative(process.cwd(), entryPath));
        } else if (stats.isDirectory()) {
            const files = await fs.readdir(entryPath);
            const sketchFiles = files.filter((file) => allowedExtensions.includes(path.extname(file)));

            if (sketchFiles.length === 0) {
                log.error(`Folder doesn't contain any sketch files.`);
                console.log("Use --new flag to start working on a sketch.");
                return;
            }

            entries.push(...sketchFiles.map((sketchFile) => path.relative(process.cwd(), sketchFile)));
        }
    } catch(error) {
        if (error.code === "ENOENT") {
            log.error(`Error: ${entry} doesn't exist.`);
        } else {
            log.error(error.message);
        }
    }

    return entries;
}

async function generateFiles(entries, options) {
    log.warning(`Building files for:`);
    entries.forEach(entry => console.log(`- ${entry}`));

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

export const sketches = {
    ${entries.map((entry) => {
        return `"${entry}": () => import("../../${entry}")`
    }).join(',')
    }
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

    const filepath = path.join(dirpath, filename);

    await fs.writeFile(filepath, code);

    return [filepath];
}
