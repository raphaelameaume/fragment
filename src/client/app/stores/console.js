import { writable } from "svelte/store";

import { traverse } from "./layout";


const modules = [];
traverse((m) => {
	modules.push(m);
});

export let enabled = modules.some(m => m.name === "console");

export const current = writable([
    // { level: "", args: ["hello world"], count: 1207 },
    // { level: "", args: [{"key": "value"}], count: 2 },
    // { level: "", args: [["hello", "world", "hello"]]},
    // { level: "", args: ["hello world"]},
	// { level: "warn", args: ["Expected some stuff"]},
    // { level: "error", args: ["Uncaughted promise"]},
]);

let mirrored = ["log", "warn", "error", "dir"];

mirrored.forEach((key) => {
	if (!enabled) return;

	let temp = console[`${key}`];

	console[`${key}`] = (...args) => {
		let isFromVite = args.some((log) => typeof log === "string" && log.includes('[vite]'));
		isFromVite = false;

		if (!isFromVite) {
			temp(...args);
		}

		current.update((logs) => {
			if (isFromVite) return logs;

			if (logs.length > 0 && arraySame(logs[logs.length - 1].args, args)) {
				logs[logs.length - 1].count++;

				return logs;
			}

			return [
				...logs,
				{ level: key, args, count: 1 },
			];
		});
	};
});


function arraySame(prev, next) {
	if (prev.length !== next.length) return false;

	let isSame = true;

	for (let i = 0; i < prev.length; i++) {
		if (prev[i] !== next[i]) {
			isSame = false;
			break;
		}
	}

	return isSame;
}

let clear = console.clear;

console.clear = () => {
	clear();
	current.update(() => []);
};
