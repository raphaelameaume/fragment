import { writable, get } from "svelte/store";

export const folders = writable([]);
export const tabs = writable([]);

export const elements = writable([]);

export function folderExists(folder, all = get(folders)) {
	let exists = false;

	if (Array.isArray(folder)) {
		for (let j = 0; j < folder.length; j++) {
			for (let i = 0; i < all.length; i++) {
				if (all[i] === folder[j]) {
					exists = true;
					break;
				} else if (all[i].children.length > 0) {
					exists = folderExists(folder[j], all[i].children);
					
					if (exists) {
						break;
					}
				}
			}
		}
	} else {
		for (let i = 0; i < all.length; i++) {
			if (all[i] === folder) {
				exists = true;
				break;
			} else if (all[i].children.length > 0) {
				exists = folderExists(folder, all[i].children);
				
				if (exists) {
					break;
				}
			}
		}
	}

	return exists;
}


elements.subscribe(all => {
	console.log(all);
})
