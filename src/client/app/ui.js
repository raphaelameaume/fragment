import { get, writable } from "svelte/store";
import { elementsNext } from "./stores/ui";

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

/**
 * @typedef {object} DisplayParams
 * @property {number} order - Define order of display comparing to other elements at the same level
 */

class UIComponent {
	constructor({
		type,
		index = get(elementsNext).length,
		parent = null,
		level = 0,
		order
	} = {}) {
		this.id = `${parent ? `${parent.id}.` : ``}${type}${level}${isFinite(index) ? `-${index}`: ``}`;
		this.type = type;
		this.index = index;
		this.order = order;
		this.parent = parent;
		this.level = level;

		this.children = [];
	}

	/**
	* Create one or multiple folder(s) at the root of Params
	* @param {string|FolderOptions|string[]|FolderOptions[]} folderOptions
	* @param {DisplayParams} [displayParams]
	* @returns Folder
	*/
	addFolder(folderOptions, displayParams = {}) {
		const add = (options) => {
			const opts = typeof options === "string" ? { label: options } : options;

			return new Folder({
				...opts,
			}, {
				parent: this,
				level: this.level + 1,
				...displayParams,
			});
		}

		if (Array.isArray(folderOptions)) {
			const folders = folderOptions.map(o => add(o));
			elementsNext.update((current) => [...current, ...folders]);
			this.children.push(...folders);

			return folders;	
		} else {
			const folder = add(folderOptions);

			elementsNext.update((current) => [...current, folder]);

			this.children.push(folder);

			return folder;
		}
	}

	/**
	 * Create subtabs
	 * @param {string[]|TabOptions[]} options 
	 * @param {*} params 
	 * @returns Tab[]
	 */
	addTabs(tabOptions, displayParams = {}) {
		const tabContainer = new Tabs(tabOptions, {
			...displayParams,
			parent: this,
			level: this.level - 1,
		});

		this.children.push(tabContainer);

		return tabs.children;
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
	 * Remove tabs
	 * @param {Tab[]} tabs 
	 * @returns 
	 */
	removeTabs(tabs) {
		const tabIDs = tabs.map((tab) => tab.id);

		this.children = this.children.filter((child) => !tabIDs.includes(child.id));

		return this;
	}
}

class Folder extends UIComponent {
	constructor({
		label = "",
		collapsed = false,
	} = {}, {
		order,
		level = 0,
		parent = null,
	} = {}) {
		super({
			type: "folder",
			parent,
			order,
			level,
		});

		this.attributes = writable({
			collapsed,
			label,
		});
		this.label = label;
		this.collapsed = collapsed;
		this.isFolder = true;
	}

	set label(value) {
		this._label = value;

		this.attributes.update((current) => {
			current.label = value;
			
			return current;
		});
	}
	
	get label() {
		return this._label;
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

class Tabs extends UIComponent {
	constructor(tabs, {
		order,
		level = 0,
		parent = null,
	} = {}) {
		super({
			type: "tabs",
			parent,
			level,
			order
		});

		this.$tabIndex = writable(0);
		this.tabIndex = 0;

		this.children = tabs.map((tabOption, index) => {
			const isString = typeof tabOption === "string";

			let label = isString ? tabOption : tabOption.label;
			let active = isString ? undefined : tabOption.active;
			let order = isString ? undefined : tabOption.order;

			return new Tab({
				index,
				label,
				active
			}, {
				order,
				level: this.level,
				parent: this,
			});
		});

		this.children.sort((a, b) => a.order - b.order);

		this.isTabs = true;
	}

	set tabIndex(value) {
		this._tabIndex = value;
		this.$tabIndex.set(value);
	}

	get tabIndex() {
		return this._tabIndex;
	}

	/**
	 * Change tab index
	 * @param {number} index 
	 */
	setActive(index) {
		this.tabIndex.set(Math.min(index, this.children.length - 1));
	}
}

class Tab extends UIComponent {
	constructor({
		index,
		label = "",
		active = false,
	} = {}, {
		order = index,
		level = 0,
		parent = null,
	} = {}) {
		super({
			type: "tab",
			index,
			level,
			parent,
			order,
		 });

		this.label = label;
		this.active = active;
		this.isTab = true;
	}

	set active(value) {
		this._active = value;

		if (this._active) {
			this.parent.tabIndex = this.index;
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
 * Create one or multiple folder(s) at the root of Params
 * @param {string|FolderOptions|string[]|FolderOptions[]} folderOptions
 * @param {DisplayParams} [displayParams]
 * @returns Folder
 */
export function addFolder(folderOptions, displayParams = {}) {
	function add(opts) {
		let folder = new Folder(typeof opts === "string" ? { label: opts } : opts, displayParams);

		return folder;
	}

	if (Array.isArray(folderOptions)) {
		let folders = folderOptions.map((o) => add(o));

		elementsNext.update((current) => {
			return [...current, ...folders];
		});

		return folders;
	}

	let folder = add(folderOptions);
	
	elementsNext.update((current) => {
		return [...current, folder];
	});
	
	return folder;
};

/**
 * Remove one or multiple folder(s) from Params
 * @param {Folder|Folder[]} folder 
 */
export function removeFolder(folder) {
	function remove(target) {
		if (!target.isFolder) {
			console.warn(`@fragment/ui -> cannot removeFolder() because argument is not a folder.`);
			console.log(target);
		} else {
			elementsNext.update((current) => current.filter(element => element !== target));
		}
	}

	if (Array.isArray(folder)) {
		folder.forEach((f) => remove(f));
	} else {
		remove(folder);
	}
};

/**
 * Create tabs at the root of Params
 * @param {string[]|TabsOptions} tabsOptions 
 * @param {DisplayParams} displayParams
 * @returns Tab[]
 */
export function addTabs(tabsOptions, displayParams = {}) {
	const tabContainer = new Tabs(tabsOptions, {
		...displayParams,
		level: -1,
	});

	elementsNext.update((current) => {
		return [...current, tabContainer];
	});

	return tabContainer.children;
}
