#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → UI</sup>
<br>

# UI

When a sketch grows in complexity, it might be handy to arrange its props across folders and tabs. `fragment` comes with built-in recursive tabs and folders to give full freedom over the way props are arranged.

```js
import { ... } from "@fragment/ui";
```

#### `addFolder`
- Type: `({ label: string, collapsed: boolean }) => Folder`

Create a folder at the root of Params and returns an instance of `Folder` to pass on to a sketch prop. 

| name | type | description | default |
|---|---|---|---|
| label | `string` | The label used to display the folder | `""` |
| collapsed | `boolean` | Set the initial state of the folder | `false`|

Example: 

```js
import { addFolder } from "@fragment/ui";

let colorsFolder = addFolder({
	label: "Colors",
	collapsed: true,
});

export let props = {
	background: {
		value: "rgb(255, 0, 0)",
		folder: colorsFolder,
	},
	text: {
		value: "rgb(0, 0, 0)",
		folder: colorsFolder,
	},
	//...other props not in folder
}
```

`addFolder` also accepts a string as a parameter like so:

```js
let colorsFolder = addFolder("Colors");
```

#### `addFolders`
- Type: `({ label: string, collapsed: boolean }[]) => Folder[]`

Create multiple folders at the root of Params in a single call. See [`addFolder`](./#addFolder) for options.

```js
import { addFolders } from "@fragment/ui";

let [sceneFolder, lightsFolder] = addFolders([
	"Scene",
	"Lights",
]);
```

#### `removeFolder`
- Type: `(folder: Folder) => void`

Remove a folder from Params

Example:
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

#### `removeFolders`
- Type: `(folders: Folder[]) => void`

Remove multiple folders from Params

Example:
```js
import { addFolders, removeFolders } from "@fragment/ui";

let [sceneFolder, lightsFolder] = addFolders(["Scene", "Lights"]);

export let init = () => {
	setTimeout(() => {
		removeFolders([sceneFolder, lightsFolder]);
	}, 2000);
}
```

#### `addTabs`
- Type: `({ label: string, active: boolean }[]) => Tab[]`

| name | type | description |
|---|---|---|
| label | `string` | The label used to display the tab |
| active | `boolean` | Specify which tab is selected on start |

Example:
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

#### `removeTab`
- Type: `(tab: Tab) => void`

Example:
```js
import { addTabs, removeTab } from "@fragment/ui";

let [sceneTab, meshTab] = addTabs(["Scene", "Mesh"]);

export let init = () => {
	onClick(() => {
		removeTab(sceneTab);
	});
}
```

#### `removeTabs`
- Type: `(tabs: Tab[]) => void`

Example:
```js
import { removeTabs } from "@fragment/ui";

let [sceneTab, meshTab] = addTabs(["Scene", "Mesh"]);

export let init = () => {
	setTimeout(() => {
		removeTabs([sceneTab, meshTab]);
	}, 2000);
}
```

Folders and tabs extends `UIComponent`, which extends methods above, allowing the creation of subfolders and subtabs on every component created.

Example:
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

If for some reasons, a prop needs to be displayed at multiple locations, an array of components can be specified. 

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
