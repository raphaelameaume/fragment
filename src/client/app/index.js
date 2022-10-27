import { folders } from "./stores/folders";

let WRAPPER_ID = 0;

class Wrapper {
	constructor({ type = "folder" } = {}, params = {}) {
		this.id = WRAPPER_ID++;
		this.type = type;
		this.params = params;
		this.children = [];
		this.parent = null;
		this.level = 0;
	}

	addFolder(options) {
		const folder = new Folder(options);
		folder.parent = this.id;
		folder.level = this.level + 1;

		console.log("Wrapper : addFolder", folder);

		this.children.push(folder);

		return folder;
	}

	removeFolder(folder) {
		this.children = this.children.filter((child) => child.id !== folder.id);

		return this;
	}

	addTabs(options) {
		const tabs = addTabs(options);

		this.children.push(...tabs);

		return tabs;
	}

	removeTabs(tabs) {
		const tabIDs = tabs.map((tab) => tab.id);

		this.children = this.children.filter((child) => !tabIDs.includes(child.id));

		return this;
	}
}

class Folder extends Wrapper {
	constructor({ label = "", expanded = true } = {}) {
		super({ type: "folder" }, { label, expanded });

		this.label = label;
	}
}

class Tabs extends Wrapper {
	constructor(tabs) {
		super({ type: "tabs" });

		this.children = tabs.map(({ title, active } = {}, index) => {
			return new Tab({ index, title, active, parent: this.id });
		});
	}
}

class Tab extends Wrapper {
	constructor({ index, title = "", active = index === 0 } = {}) {
		super({ type: "tab" }, { index, title, active });
	}
}

export function addFolder(options) {
	let folder = new Folder(options)

	folders.update((current) => {
		return [...current, folder];
	});

	return folder;
}

export function addTabs(tabs) {
	const tabContainer = new Tabs(tabs);

	return tabContainer.children;
}
