#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [API](../README.md#apis) → UI</sup>
<br>

# UI

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

let [sceneFolder, lightsFolder] = addFolders(["Scene", "Lights"]);
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

- Alternative: `(labels: string[]) => Tab[]`

| name | type | description |
|---|---|---|
| labels | `string[]` | The labels used to display each tab |

[Example](../guide/organizing-props.md#create-tabs)


Example:


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

[Example](../guide/organizing-props.md#remove-tabs)
