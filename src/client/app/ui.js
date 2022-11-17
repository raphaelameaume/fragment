import { get, writable } from "svelte/store";
import { elementsNext } from "./stores/folders";

/**
 * @typedef {object} FolderOptions
 * @property {string} [label=""] - The label used on display
 * @property {boolean} [collapsed=false] - Collapse the folder on init
 */

/**
 * @typedef {object} TabOptions
 * @property {string} [label=""] - The label used on display
 * @property {boolean} [active=false] - Set the active tab. Default to first tab created.
 */

class Wrapper {
	constructor({
		type,
		index,
		level = 0,
		parent = null,
		children = []
	} = {}, params = {}) {
		this.id = `${parent ? `${parent.id}.` : ``}${type}${level}${isFinite(index) ? `-${index}`: ``}`;
		this.index = index;
		this.type = type;
		this.params = params;
		this.children = children;
		this.parent = parent;
		this.level = level;
	}

	/**
	* Create a subfolder
	* @param {string|FolderOptions} options
	* @returns Folder
	*/
	addFolder(options) {
		const folder = new Folder(typeof options === "string" ? { label: options } : options, {
			parent: this,
			level: this.level + 1,
		});

		elementsNext.update((current) => [...current, folder]);

		this.children.push(folder);

		return folder;
	}

	/**
	* Create subfolders
	* @param {string[]|FolderOptions[]} options
	* @returns Folder[]
	*/
	addFolders(options) {
		return options.map((option) => this.addFolder(option));
	}

	/**
	 * Remove a subfolder
	 * @param {Folder} folder 
	 * @returns 
	 */
	removeFolder(folder) {
		this.children = this.children.filter((child) => child !== folder);

		removeFolder(folder);

		return this;
	}

	/**
	 * Create subtabs
	 * @param {string[]|TabOptions[]} options 
	 * @param {*} params 
	 * @returns Tab[]
	 */
	addTabs(options, params) {
		const tabs = new Tabs(options, params, {
			parent: this,
			level: this.level - 1,
		});

		this.children.push(tabs);

		return tabs.children;
	}

	/**
	 * Remove tabs
	 * @param {Tabs} tabs 
	 * @returns 
	 */
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

		this.attributes = writable({
			collapsed,
		});
		this.label = label;
		this.collapsed = collapsed;
		this.isFolder = true;
	}

	set collapsed(value) {
		this._collapsed = value;

		this.attributes.update((current) => {
			current.collapsed = value;
			
			return current;
		});
	}

	get collapsed() {
		return this._collapsed;
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

		this.tabIndex = writable(-1);

		this.children = [
			...this.children,
			...tabs.map((tabOption, index) => {
				let label = typeof tabOption === "string" ? tabOption : tabOption.label;
				let active = typeof tabOption === "string" ? undefined : tabOption.active;

				return new Tab({
					index,
					label,
					active
				}, {
					level: this.level + 1,
					parent: this,
				});
			})
		];

		this.isTabs = true;
	}

	/**
	 * Change tab index
	 * @param {number} index 
	 */
	setActive(index) {
		this.tabIndex.set(Math.min(index, this.children.length - 1));
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
		this.isTab = true;
	}

	set active(value) {
		this._active = value;

		if (this._active) {
			this.parent.tabIndex.set(this.index);
		}

		this.parent.children.forEach((child, i) => {
			if (i !== this.index) {
				child._active = false;
			}
		});
	}

	get active() {
		return this._active;
	}
}

/**
 * Create a new folder at the root of Params
 * @param {string|FolderOptions} options
 * @returns Folder
 */
export function addFolder(options) {
	let folder = new Folder(typeof options === "string" ? { label: options } : options, {
		index: get(elementsNext).length,
	});

	elementsNext.update((current) => {
		return [...current, folder];
	});

	return folder;
};

/**
 * Create new folders at the root of Params
 * @param {string[]|FolderOptions[]} options
 * @returns Folder[]
 */
export function addFolders(options) {
	return options.map((option) => addFolder(option));
}

/**
 * Create tabs at the root of Params
 * @param {string[]|TabOptions} tabs 
 * @returns Tabs
 */
export function addTabs(tabs, options) {
	const tabContainer = new Tabs(tabs, options, {
		index: get(elementsNext).length,
	});

	elementsNext.update((current) => {
		return [...current, tabContainer];
	});

	return tabContainer.children;
}

/**
 * Remove a folder from Params
 * @param {Folder} folder 
 */
export function removeFolder(folder) {
	elementsNext.update((current) => current.filter(element => element !== folder));
};

/**
 * Remove multiple folders from Params
 * @param {Folder[]} folders 
 */
export function removeFolders(folders) {
	elementsNext.update((current) => current.filter(element => !folders.includes(element)));
}
