import { writable } from "svelte/store";
import { tree, traverse } from "./layout";

export const logs = writable([]);

let mirrored = ["log", "warn", "error", "dir"];
let enabled = false;
let refs = {};

tree.subscribe((t) => {
	let hasConsole = false;
	traverse((c) => {
		if (c.type === "module" && c.name === "console") {
			hasConsole = true;
		}
	}, t);

	if (hasConsole && !enabled) {
		enable();
	} else if (enabled && !hasConsole) {
		disable();
	}
});

let clear = console.clear;

function enable() {
	enabled = true;
	mirrored.forEach((key) => {
		const ref = console[`${key}`]
		refs[`${key}`] = ref;

		console[`${key}`] = (...args) => {
			let isFromVite = args.some((log) => typeof log === "string" && log.includes('[vite]'));

			if (!isFromVite) {
				ref(...args);
			}

			logs.update((logs) => {
				if (isFromVite) return logs;

				if (logs.length > 0) {
					const lastLog = logs[logs.length - 1];
					const { level: lastLevel, args: lastArgs } = lastLog;

					if (lastLevel === key && lastArgs[0] === args[0]) {
						logs[logs.length - 1].count++;
						return logs;
					}
				}

				return [
					...logs,
					{ level: key, args, count: 1 },
				];
			});
		};
	});

	console.clear = () => {
		clear();
		logs.update(() => []);
	};
}

function disable() {
	enabled = false;
	mirrored.forEach((key) => {
		const ref = refs[key];

		console[`${key}`] = ref;
	});

	console.clear = clear;
}
