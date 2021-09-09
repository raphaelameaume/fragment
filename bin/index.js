#!/usr/bin/env node

import sade from "sade";
import { run } from "../src/cli/index.js";

sade('fragment [entry]')
    .version('0.1.0')
    .describe('Run a dev environment for fragment')
    .option('-t, --template', 'three/perspective')
    .option('-p, --port', 'Port to bind', 3000)
    .option('-r, --renderer', 'Port to bind', 'three')
    .option('--new', 'Create file if it does not exist', false)
    .option('--dir', 'Directory to serve', "")
    .option('--new', 'Create a new file', false)
    .action((entry, options) => {
        run(entry, options);
    })
    .parse(process.argv);
