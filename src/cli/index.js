import fs from "fs/promises";
import path from "path";
import log from "./log.js";

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
        console.log("Create entry file", entryPath);
        await fs.writeFile(entryPath, `hello world`);
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
