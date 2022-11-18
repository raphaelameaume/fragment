#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Organizing props</sup>
<br>

# Organizing props

When a sketch grows in complexity, it might be handy to arrange its props across folders and tabs. `fragment` comes with built-in recursive tabs and folders to give full freedom over the way props are arranged. See [UI Docs](../api/ui.md) for details about the API.

## Folders

### Create a folder

```js
// import from Fragment namespace
import { addFolder } from "@fragment/ui";

// create a folder
let colorsFolder = addFolder({
	label: "Colors",
	collapsed: true,
});

// assign created folder to `folder` key on a specific prop
export let props = {
	background: {
		value: "rgb(255, 0, 0)",
		folder: colorsFolder, 
	},
	text: {
		value: "rgb(0, 0, 0)",
		folder: colorsFolder,
	},
}
```
### Create a subfolder

```js
import { addFolder, addTabs } from "@fragment/ui";

let folder = addFolder("mainFolder");
let subfolder = folder.addFolder("subfolder");

export let props = {
	background: {
		value: "rgb(255, 0, 0)",
		folder: subfolder,
	},
}
```

### Remove a folder

```js 
import { addFolder, removeFolder } from "@fragment/ui";

let folder;

export let init = () => {
	onClick(() => {
		if (folder) {
			removeFolder(folder);
			folder = null;
		} else {
			folder = addFolder("Dynamic folder");
		}
	})
}
```

### Update folder from code

```js
...

let folder = addFolder("Folder");

export let init = () => {
	onClick(() => {
		folder.collapsed = true;
	});
}
```
## Tabs

### Create tabs
```js
import { addTabs } from "@fragment/ui";

let [sceneTab, meshTab] = addTabs([
	{ label: "Scene" },
	{ label: "Mesh", active: true },
]);

export let props = {
	backgroundColor: {
		value: "rgba(255, 0, 0, 0.1)",
		tab: sceneTab,
	}
}
```

### Update tab from code
```js
let [sceneTab, meshTab] = addTabs(["Scene", "Mesh"]);

export let init = () => {
	...
	mesh.onclick = () => {
		meshTab.active = true; // highlight tab on click
	}
};
```

### Remove tabs
```js
import { removeTabs } from "@fragment/ui";

let [sceneTab, meshTab] = addTabs(["Scene", "Mesh"]);

export let init = () => {
	setTimeout(() => {
		removeTabs([sceneTab, meshTab]);
	}, 2000);
}
```

## Architecturing components

Folders and tabs extends methods above, allowing the creation of subfolders and subtabs on every component created.

```js
import { addFolder, addTabs } from "@fragment/ui";

let folder = addFolder("mainFolder");
let subfolder = folder.addFolder("subfolder");

let [sceneTab, meshTab] = addTabs(["Scene", "Mesh"]);

let geometryFolder = meshTab.addFolder("geometry");
let materialFolder = meshTab.addFolder("material");

let [materialTab0, materialTab1] = materialFolder.addTabs(["tab0", "tab1"]);

export let props = {
	meshColor: {
		value: "#ff0000",
		tab: materialTab0,
	}
}
```

## Ordering components

UI components will be orderered by order of instanciation by default. You can manage the order of display by specifying an `order` value as a second argument to `addFolder()` and `addTabs()`.

```js
import { addFolder, addTabs } from "@fragment/ui";

let folder = addFolder("Hello", {
  order: 1,
});

let [sceneTab, meshTab] = addTabs(["Scene", "Mesh"], {
  order: 0, // tabs will be displayed before folder above
});
```

## Display prop in multiple locations at the same time

If for some reasons, a prop needs to be displayed at multiple locations at the same time, an array of components can be specified to `prop.folder` or `prop.tab` 

```js
import { addFolder, addTabs } from "@fragment/ui";

let folder = addFolder("mainFolder");
let subfolder = folder.addFolder("subfolder");
let [sceneTab, meshTab] = addTabs(["Scene", "Mesh"]);

export let props = {
	meshColor: {
		value: "#ff0000",
		tab: [sceneTab, meshTab],
		folder: [folder, subfolder],
	}
}
```

> ⚠️ A prop can be displayed at multiple locations in tabs or folders but cannot be displayed simultaneously in a `UIComponent` and at the root of Params at the same time.
