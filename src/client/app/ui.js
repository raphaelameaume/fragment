import { writable, get } from "svelte/store";
import { client } from "./client";
import { index, folders, tabs, elements, elementsNext } from "./stores/folders";

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
		const folder = new Folder(typeof options === "string" ? { label: options } : options, {
			parent: this.id,
			level: this.level + 1,
		});

		elementsNext.update((current) => [...current, folder]);

		this.children.push(folder);

		return folder;
	}

	addFolders(options) {
		return options.map((option) => this.addFolder(option));
	}

	removeFolder(folder) {
		this.children = this.children.filter((child) => child !== folder);

		removeFolder(folder);

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
		collapsed = false,
		...params
	} = {}, {
		index,
		level = 0,
		parent = null,
		children = [],
	} = {}) {
		super({
			type: "folder",
			index,
			level,
			parent,
			children
		}, params);

		this.label = label;
		this.collapsed = collapsed;
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
	let folder = new Folder(typeof options === "string" ? { label: options } : options, {
		index: get(elements).length,
	});

	elementsNext.update((current) => {
		return [...current, folder];
	});

	return folder;
};

export function addFolders(options) {
	return options.map((option) => addFolder(option));
}

export function addTabs(tabs, options) {
	const tabContainer = new Tabs(tabs, options, {
		index: get(elements).length,
	});

	elementsNext.update((current) => {
		return [...current, tabContainer];
	});

	return tabContainer.children;
}

export function removeFolder(folder) {
	elementsNext.update((current) => current.filter(element => element !== folder));
};

export function removeFolders(folders) {
	elementsNext.update((current) => current.filter(element => !folders.includes(element)));
}
