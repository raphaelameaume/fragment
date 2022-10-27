import { folders, tabs, elements } from "./stores/folders";

let WRAPPER_ID = 0;

class Wrapper {
	constructor({
		type,
		index,
		level = 0,
		parent = null,
		children = []
	} = {}, params = {}) {
		this.id = `${parent ? `${parent}.` : ``}${type}${level}${isFinite(index) ? `-${index}`: ``}`;
		this.index = index;
		this.type = type;
		this.params = params;
		this.children = children;
		this.parent = parent;
		this.level = level;
	}

	addFolder(options) {
		const folder = new Folder(options, {
			parent: this.id,
			level: this.level + 1,
		});

		this.children.push(folder);

		return folder;
	}

	removeFolder(folder) {
		this.children = this.children.filter((child) => child.id !== folder.id);

		return this;
	}

	addTabs(options, params) {
		const tabs = new Tabs(options, params, {
			parent: this.id,
			level: this.level +1,
		});

		this.children.push(tabs);

		return tabs.children;
	}

	removeTabs(tabs) {
		const tabIDs = tabs.map((tab) => tab.id);

		this.children = this.children.filter((child) => !tabIDs.includes(child.id));

		return this;
	}
}

class Folder extends Wrapper {
	constructor({
		label = "",
		expanded = true,
		...params
	} = {}, {
		level = 0,
		parent = null,
		children = [],
	} = {}) {
		super({
			type: "folder",
			level,
			parent,
			children
		}, params);

		this.label = label;
		this.expanded = expanded;
	}
}

class Tabs extends Wrapper {
	constructor(tabs, params = {}, {
		level = 0,
		parent = null,
		children = [],
	} = {}) {
		super({
			type: "tabs",
			level,
			parent,
			children,
		}, params);

		this.children = [
			...this.children,
			...tabs.map(({ label, active } = {}, index) => {
				return new Tab({
					index,
					label,
					active
				}, {
					level: this.level + 1,
					parent: this.id,
				});
			})
		];
	}
}

class Tab extends Wrapper {
	constructor({
		index,
		label = "",
		active = index === 0,
		...params
	} = {}, {
		parent = null,
		level = 0,
		children = [],
	} = {}) {
		super({
			type: "tab",
			index,
			level,
			parent,
			children,
		 }, params);

		this.label = label;
		this.active = active;
	}
}

export function addFolder(options) {
	let folder = new Folder(options);

	elements.update((current) => {
		const ids = current.map((c) => c.id);

		if (!ids.includes(folder.id)) {
			return [...current, folder];
		} else {
			const index = ids.indexOf(folder.id);
			const swap = [...current];

			swap[index] = folder;

			return swap;
		}
	});

	return folder;
}

export function addTabs(tabs, options) {
	const tabContainer = new Tabs(tabs, options);

	elements.update((current) => {
		const ids = current.map((c) => c.id);

		if (!ids.includes(tabContainer.id)) {
			return [...current, tabContainer];
		} else {
			const index = ids.indexOf(tabContainer.id);
			const swap = [...current];

			swap[index] = tabContainer;

			return swap;
		}
	});

	return tabContainer.children;
}
