# Organizing props

As the number of `props` increases across a project, the list of controllers can become long and difficult to navigate. Fragment provides two mechanisms for structuring this list: [folders](#folders) and [groups](#groups).

## Folders

Props can be sorted into folders and subfolders, similar to organizational systems used in many GUI libraries.

To place a prop inside a folder:

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'cubes', // <- Fragment will put the count controller in a folder named "cubes"
	}
};
```

When multiple props share the same folder name, they are added to the same folder based on declaration order.

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'cubes', // <- Fragment will put the count controller in a folder named "cubes"
	},
	speed: {
		value: 1,
		folder: 'physics', // <- Fragment will create a second folder 'physics'
	},
	scale: {
		value: 1,
		folder: 'cubes', // <- Fragment will put the "scale" controller in the first folder "cubes"
	}
};
```

Subfolders can be created by concatenating folder names with a `.`:

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'scene.objects.cubes', // <- Fragment will put the count controller in a subfolder named "cubes", child of another folder named "objects", itself child of a folder named "scene"
	}
};
```

Folders are not collapsed by default. During development, Fragment preserves their open or collapsed state across hot reloads. The desired initial state can also be specified directly within the folder string:

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'cubes[collapsed=true]', // <- Fragment will put the count controller in a folder named "cubes" and set the initial state to collapsed
	}
};
```

## Groups

Props can also be organized in **groups**. Groups can be used to filter props display in the Params module.
If one prop has a group specified, Fragment will create a `<select>` at the top of the Params module so you can filter the group to be displayed.
This behaviour allows to have one or multiple Params modules in the layout and arrange props in very different ways.

```js
export let props = {
	color: {
		value: '#ff0000',
		group: 'materials',
	},
};
```

When a single group is defined, Fragment generates three filters by default:
- "all" (shows all props)
- "output" (related to canvas size and dimensions)
- "materials" (the custom group)

Fragment preserves the selected group of each Params module across hot reloads and full page refreshes.
