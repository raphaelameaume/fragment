import fs from "fs";
import { watch as chokidar } from "chokidar";

export function mkdirp(dir) {
	try {
		fs.mkdirSync(dir, { recursive: true });
	} catch (e) {
		if (e.code === 'EEXIST') return;
		throw e;
	}
}

export function watch(paths, fn, options = {}) {
    const watcher = chokidar(paths, {
        ignored: /[\/\\]\./,
        persistent: true,
        ...options,
    })
    watcher.on('ready', () => {
        watcher.on('add', fn);
    });
    watcher.on('change', fn);

    if (!options.ignoreUnlink) {
        watcher.on('unlink', fn);
    }

    return watcher;
}
