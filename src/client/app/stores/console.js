import { writable } from "svelte/store";

export const current = writable([
    // { level: "", args: ["hello world"], count: 1207 },
    // { level: "", args: [{"key": "value"}], count: 2 },
    // { level: "", args: [["hello", "world", "hello"]]},
    // { level: "", args: ["hello world"]},
	// { level: "warn", args: ["Expected some stuff"]},
    // { level: "error", args: ["Uncaughted promise"]},
]);

let mirrored = ["log", "warn", "error"];

mirrored.forEach((key) => {
	let temp = console[`${key}`];

	console[`${key}`] = (...args) => {
		temp(...args);

		current.update((logs) => {
			if (logs.length > 0 && arraySame(logs[logs.length - 1].args, args)) {
				lastLog.count++;

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

// console.log = (...args) => {
//     current.update((logs) => {
// 		let lastLog = logs[logs.length - 1];

// 		if (arraySame(lastLog.args, args)) {
// 			lastLog.count++;

// 			return logs;
// 		}

// 		return [
// 			...logs,
// 			{ level: "", args, count: 1 },
// 		];
// 	});

//     log(...args);
// };

// let error = console.error;

// console.error = (...args) => {
// 	current.update((logs) => {
// 		error(...args);

// 		return [
// 			...logs,
// 			{ level: "error", args, count: 1 },
// 		]
// 	});
// };

// let warn = console.warn;

// console.warn = (...args) => {
// 	current.update((logs) => {
// 		warn(...args);

// 		return [
// 			...logs,
// 			{ level: "warn", args, count: 1 },
// 		]
// 	});
// };
