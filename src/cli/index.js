import fs from "fs/promises";
import path from "path";
import log from "./log.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const run = async (entry, options) => {
    try {
        const entries = await createEntries(entry, options);
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
    
    const shouldCreateFile = options.new;

    async function createEntryFile(entryPath) {
        const templates = {
            "2d": "./templates/2d.js",
            "three/orthographic": "./templates/three-orthographic.js",
            "three/perspective": "./templates/three-perspective.js",
            "ogl/orthographic": "./templates/ogl-orthographic.js",
            "ogl/perspective": "./templates/ogl-perspective.js",
            "default": "./templates/default.js",
        };

        const createFromTemplate = typeof options.template === "string";
        const template = createFromTemplate ? templates[options.template] : templates.default;

        if (!template) {
            log.error(`Wrong argument value.`);
            console.log(`Template ${options.template} doesn't exist.\nPossible values are:`);
            Object.keys(templates).forEach((key) => {
                console.log(key);
            });
            return;
        }

        const templatePath = path.join(__dirname, template);
        const templateContent = await fs.readFile(templatePath);

        await fs.writeFile(entryPath, templateContent);

        console.log(`${log.prefix} Created ${entry} on disk.`);
    }

    async function checkExistence(entry) {
        const entryPath = path.join(process.cwd(), entry);

        try {
            const stats = await fs.lstat(entryPath);

            if (stats.isDirectory()) {
                console.log("Entry is a directory");
            } else if (stats.isFile()) {
                if (shouldCreateFile) {
                    log.warning(`Ignored argument:`);
                    console.log(`${entry} already exists.`);
                }
            } else {

            }
        } catch(error) {
            if (error.code === "ENOENT") {
                if (shouldCreateFile) {
                    createEntryFile(entryPath)
                } else {
                    log.error(`Missing file: ${entry} doesn't exist.`)
                    console.log("Use --new flag to create the file automatically");
                }
            }
        }
    }

    checkExistence(entry);

    console.log("createEntries", entry);

    const entries = [];

    return entries;
}
