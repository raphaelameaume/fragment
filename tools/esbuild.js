const path = require('path');
const log = require('fancy-log');
const chalk = require('chalk');
const { watch } = require('chokidar');
const { exec } = require('child_process');

function command(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (!error) {
                resolve();
            } else {
                console.log(stderr);
                reject(error);
            }
        });
    });
}

let input = 'public/index.js';
let directory = 'public';
let output = 'public/assets/scripts/app.js';

function createCommand() {
    return `esbuild ${input} --bundle '--define:process.env.NODE_ENV=\"development\"' --outfile=${output} --sourcemap`;
}

let cmd = createCommand();

async function run() {
    let startTime = Date.now();

    await command(cmd);

    let endTime = Date.now();
    
    log(chalk.green(`JS :: Bundled in ${endTime - startTime}ms`));
}

let dir = path.resolve(directory);
let watchlist = [
    `${dir}/stages/`,
    `${dir}/index.js`,
]

console.log(watchlist);

async function init() {
    const watcher = watch(watchlist, {
        ignored: /[\/\\]\./,
        persistent: true
    })
    watcher.on('ready', () => {
        watcher.on('add', run); // Listen to files added
        run()
    });
    watcher.on('change', run); // Listen to files changed
    watcher.on('unlink', run); // Listen to files removed
}

init();

module.exports = { run: run };