import path from "path";
import fs from "fs";
import log from "../log.js";

export default function checkDependencies({ cwd, entries } = {}) {
	const entriesPaths = entries.map(entry => path.join(cwd, entry));


    return {
        name: 'check-dependencies',
		transform(src, id) {
			if (entriesPaths.some((entryPath) => id.includes(entryPath))) {
                let rendering = "p5"; // check for regex here
                let dependency = path.join(cwd, `node_modules/${rendering}`);
                let dependencyInstalled = fs.existsSync(dependency);

                if (!dependencyInstalled) {
                    log.error(`Missing dependency [${rendering}]`);
                    console.log(`
It looks like you're trying to render a [${rendering}] sketch without having ${rendering} installed.
Run 'npm install ${rendering}' and restart fragment in order to start using ${rendering}.
                    `)
                }
            }
		}
    };
}
