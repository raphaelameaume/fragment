import { store as props } from "./props";
import { client } from "../client";

export { props };

const all = {
	props,
};

let socket = false;

// Object.keys(all).forEach((storeKey) => {
// 	const store = all[storeKey];

// 	store.subscribe((current) => {
// 		if (!socket) {
// 			client.emit('store-update', {
// 				key: storeKey,
// 				value: current,
// 			});
// 		}
// 	});
// });

// client.on('store-update', ({ key, value }) => {
// 	const store = all[key];

// 	if (store && !socket) {
// 		socket = true;
// 		console.log("update store");
// 		store.set(value);
// 		socket = false;
// 		console.log("set socket false");
// 	}
// });
