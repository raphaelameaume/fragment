#!/usr/bin/env node

import sade from "sade";
import { run } from "../src/cli/index.js";

sade('fragment [entry]')
    .version('0.1.0')
    .describe('Run a dev environment for fragment')
    .option('-n', '--new', 'Create file if it does not exist', false)
    .option('-t, --template', 'Specify template to create the file from', '2d')
    .option('-p, --port', 'Port to bind', 3000)
    .action((entry, options) => {
        run(entry, options);
    })
    .parse(process.argv);
