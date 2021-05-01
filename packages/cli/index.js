#!/usr/bin/env node

const fs = require("fs/promises");
const sade = require("sade");
const path = require("path");

const log = require("./log.js");
const serve = require("./serve.js");
const bundle = require("./bundle.js");

sade('fragment [entry]', true)
    .version('1.0.0')
    .describe('Run a dev environment for fragment')
    .option('-t, --template', 'three/perspective')
    .option('-p, --port', 'Port to bind', 3000)
    .option('-r, --renderer', 'Port to bind', 'three')
    .option('--new', 'Create file if it does not exist', false)
    .option('--dir', 'Directory to serve', "")
    .option('--new', 'Create a new file', false)
    .action(async (entry, opts) => {
        if (entry === undefined) {
            log.error(`[path] is undefined.`);
            return;
        }
        // check if path is a directory or a single file
        const stats = await fs.lstat(entry);
        const isEntryDir = stats.isDirectory();
        const isEntryFile = !isEntryDir && stats.isFile();

        if (isEntryDir || isEntryFile) {
            const dir = opts.dir ? path.resolve(opts.dir) : (isEntryDir ? entry : path.resolve(path.dirname(entry)));
            const { port } = opts;

            const entries = isEntryFile ? [entry] : (await fs.readdir(entry));

            await bundle(entries);
            await serve(dir, port);
        } else {
            log.error(`[path] needs to be a file or a directory.`);
        }
    })
    .parse(process.argv);
