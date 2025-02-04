import { rendering } from './rendering.svelte';
import {
	deepAssign,
	deepEqual,
	hydrate,
	isFunction,
	isObject,
	persist,
} from './utils.svelte';

const noop = () => {};

class Sketch {
	props = $state({});
	canvas = $state(null);
	backgroundColor = $state('inherit');
	propsGroups = $state([]);
	propsFolders = $state([]);
	version = $state(0);

	constructor({ key, instance, previous }) {
		this.key = key;
		this.instance = instance;
		this.name = this.instance.name ?? this.key;
		this.fps = this.instance.fps;
		this.load = this.instance.load ?? noop;
		this.setup = this.instance.setup ?? this.instance.init ?? noop;
		this.draw = this.instance.draw ?? this.instance.update ?? noop;
		this.needsUpdate = this.instance.needsUpdate ?? noop;
		this.resize = this.instance.resize ?? noop;
		this.duration = this.instance.duration;
		this.exportDir = this.instance.exportDir;
		this.filenamePattern = this.instance.filenamePattern;
		this.backgroundColor = this.instance.backgroundColor ?? 'inherit';
		this.buildConfig = this.instance.buildConfig ?? {};

		this.recording = null;
		this.params = {};
		this.beforeCapture = [];
		this.beforeRecord = [];
		this.afterCapture = [];
		this.afterRecord = [];

		this.reconcile(previous);
	}

	reset() {
		Object.keys(this.props).forEach((key) => {
			this.updateProp(key, this.props[key].__initialValue);
		});

		this.propsFolders.forEach((fieldgroup) => {
			fieldgroup.collapsed = fieldgroup.__initialCollapsed;
		});
	}

	reconcile(previous) {
		const instanceProps = this.instance.props ?? {};
		const newProps = {};
		const newPropsGroups = [];
		const newPropsFolders = [];

		Object.keys(instanceProps).forEach((key) => {
			this.createProp(
				newProps,
				key,
				instanceProps[key],
				newPropsFolders,
				newPropsGroups,
			);
		});

		const restoreProps = (prevProps) => {
			const prevPropKeys = Object.keys(prevProps);

			if (prevPropKeys.length > 0) {
				prevPropKeys.forEach((propKey) => {
					let prevProp = prevProps[propKey];
					let newProp = newProps[propKey];
					let instanceProp = instanceProps[propKey];

					if (newProp) {
						if (
							isObject(newProp.__initialValue) &&
							deepEqual(
								newProp.__initialValue,
								prevProp.__initialValue,
							)
						) {
							deepAssign(newProp.value, prevProp.value);
							deepAssign(instanceProp.value, prevProp.value);
							newProp.__currentValue = newProp.value;
						} else if (
							newProp.__initialValue === prevProp.__initialValue
						) {
							newProp.value = prevProp.value;
							newProp.__currentValue = newProp.value;
							instanceProp.value = prevProp.value;
						}

						newProp.triggers = prevProp.triggers;

						if (prevProp.params) {
							// reconcile locked VectorInput from UI
							if (prevProp.params.locked !== undefined) {
								newProp.params.locked = prevProp.params.locked;
							}
						}
					}
				});
			}
		};

		const restorePropsFoldersState = (prevFolders) => {
			const restoreFolder = (prevFolder) => {
				const newFolder = newPropsFolders.find((f) => {
					return prevFolder.id === f.id;
				});

				if (
					newFolder &&
					newFolder.__initialCollapsed ===
						prevFolder.__initialCollapsed
				) {
					newFolder.collapsed = prevFolder.collapsed;
				}
			};

			if (prevFolders.length > 0) {
				prevFolders.forEach((prevFolder) => {
					restoreFolder(prevFolder);
				});
			}
		};

		if (previous) {
			restoreProps(previous.props);
			restorePropsFoldersState(previous.propsFolders);
		} else {
			const {
				props: savedProps = {},
				propsFolders: savedPropsFolders = [],
			} = hydrate(this.key);
			restoreProps(savedProps);
			restorePropsFoldersState(savedPropsFolders);
		}

		Object.keys(newProps).forEach((key) => {
			const newProp = newProps[key];

			// compute hidden after restoring props values
			newProp.hidden = newProp.__hidden();
		});

		this.props = newProps;
		this.propsGroups = newPropsGroups;
		this.propsFolders = newPropsFolders;
	}

	createProp(
		target,
		key,
		instanceProp,
		propsFoldersCollection,
		propsGroupsCollection,
	) {
		const duplicateInitialValue = (value) => {
			if (isFunction(value)) {
				return value;
			}

			if (isObject(value)) {
				return structuredClone(value);
			}

			return value;
		};

		let {
			value,
			params = {},
			triggers = [],
			group,
			folder,
			displayName,
		} = instanceProp;

		if (value?.isColor) {
			value = { r: value.r, g: value.g, b: value.b };
		} else if (value?.isVector2) {
			value = { x: value.x, y: value.y };
		} else if (value?.isVector3) {
			value = { x: value.x, y: value.y, z: value.z };
		} else if (value?.isVector4) {
			value = { x: value.x, y: value.y, z: value.z, w: value.w };
		} else if (value?.isQuaternion) {
			value = { x: value.x, y: value.y, z: value.z, w: value.w };
		}

		let __hidden =
			typeof instanceProp.hidden === 'function'
				? instanceProp.hidden
				: () => instanceProp.hidden;

		let initialValue = duplicateInitialValue(value);

		if (group && !propsGroupsCollection.includes(group)) {
			propsGroupsCollection.push(group);
		}

		if (folder) {
			this.createPropFolder(folder, propsFoldersCollection, key);
		}

		let prop = {
			value,
			__initialValue: initialValue,
			__currentValue: value,
			__hidden,
			params: structuredClone(params),
			triggers,
			group,
			folder,
			displayName,
		};

		target[key] = prop;

		return prop;
	}

	updateProp(key, newValue) {
		const prop = this.props[key];
		const instanceProp = this.instance.props[key];

		if (prop) {
			prop.value = newValue;
			prop.__currentValue = newValue;
		}

		if (instanceProp) {
			if (!deepEqual(instanceProp.value, newValue)) {
				instanceProp.value = newValue;
			}

			instanceProp.onChange?.(instanceProp, {
				width: rendering.width,
				height: rendering.height,
				pixelRatio: rendering.pixelRatio,
				canvas: this.canvas,
			});
		}

		Object.keys(this.props).forEach((key) => {
			this.props[key].hidden = this.props[key].__hidden();
		});

		this.version++;
	}

	createPropFolder(folder, collection, key) {
		if (!folder) return undefined;

		let propFolder;
		let names = folder.split('.');

		if (names.length > 0) {
			let root;
			let collapsedRegex = /^(.*?)(?:\[collapsed=(true|false)\])?$/;

			for (let i = 0; i < names.length; i++) {
				let name = names[i];
				let match = name.match(collapsedRegex);
				let displayName = match[1];
				let collapsed = match[2] ? match[2] === 'true' : false;

				let depth = i;
				let id = [...names].slice(0, i + 1).join('.');
				let parentId = [...names].slice(0, i).join('.');
				let parent =
					depth > 0
						? collection.find((f) => f.id === parentId)
						: undefined;

				let fieldgroup = collection.find((f) => f.id === id);

				if (!fieldgroup) {
					fieldgroup = {
						id,
						type: 'fieldgroup',
						displayName,
						collapsed,
						__initialCollapsed: collapsed,
						children: [],
						parent,
						depth,
						root,
					};

					if (parent) {
						parent.children.push(fieldgroup);
					}

					collection.push(fieldgroup);
				}

				if (i === 0) {
					root = fieldgroup;
				}

				if (i === names.length - 1) {
					fieldgroup.children.push({
						type: 'field',
						key,
					});

					propFolder = fieldgroup;
				}
			}
		}

		return propFolder;
	}

	updateFolder(folder, collapsed) {
		this.propsFolders.forEach((f, index) => {
			if (f === folder) {
				this.propsFolders[index].collapsed = collapsed;
			}
		});
	}

	save() {
		persist(this.key, this);
	}

	dispose() {
		// if (this.renderer && typeof renderer.onDestroyPreview === 'function') {
		// 	this.renderer.onDestroyPreview({
		// 		id: this.mountID,
		// 		container,
		// 		canvas,
		// 	});
		// }
	}

	sync() {
		Object.keys(this.instance.props ?? {}).forEach((key) => {
			const instanceProp = this.instance.props[key];
			const prop = this.props[key];

			if (!prop) {
				this.createProp(
					this.props,
					key,
					instanceProp,
					this.propsFolders,
					this.propsGroups,
				);
			} else {
				// sync value
				if (
					!isFunction(instanceProp.value) &&
					!deepEqual(instanceProp.value, prop.__currentValue)
				) {
					this.updateProp(key, instanceProp.value);
				}

				// sync displayName
				if (instanceProp.displayName !== prop.displayName) {
					prop.displayName = instanceProp.displayName;
				}

				if (instanceProp.folder !== prop.folder) {
					// if the existing prop already had a folder
					if (prop.folder) {
						const fieldgroup = this.propsFolders.find(
							(f) => f.id === prop.folder,
						);

						if (!fieldgroup) {
							console.warn(
								`Cannot find fieldgroup from prop.folder`,
								prop.folder,
							);
							console.log(this.propsFolders);
							return;
						}

						const { children } = fieldgroup;

						const childIndex = children.findIndex(
							(c) => c.key === key,
						);
						fieldgroup.children.splice(childIndex, 1);

						const removeFolderIfNeeded = (fieldgroup) => {
							if (fieldgroup.children.length === 0) {
								const currentFolderIndex =
									this.propsFolders.findIndex(
										(c) => c === fieldgroup,
									);
								this.propsFolders.splice(currentFolderIndex, 1);

								const { parent } = fieldgroup;

								if (parent) {
									const childIndex =
										parent.children.findIndex(
											(c) => c.id === fieldgroup.id,
										);
									parent.children.splice(childIndex, 1);
									removeFolderIfNeeded(fieldgroup.parent);
								}
							}
						};

						removeFolderIfNeeded(fieldgroup);
					}

					if (instanceProp.folder) {
						this.createPropFolder(
							instanceProp.folder,
							this.propsFolders,
							key,
						);
						prop.folder = instanceProp.folder;
					} else {
						prop.folder = undefined;
					}
				}

				// sync hidden
				prop.hidden = prop.__hidden();

				// sync params
				if (instanceProp.params) {
					for (const paramKey in instanceProp.params) {
						const instanceParam = instanceProp.params[paramKey];
						const param = prop.params[paramKey];
						let needsUpdate = !deepEqual(instanceParam, param);

						if (needsUpdate) {
							prop.params[paramKey] =
								structuredClone(instanceParam);
						}
					}
				}

				Object.keys(prop.params).forEach((paramKey) => {
					if (!(paramKey in (instanceProp.params ?? {}))) {
						delete prop.params[paramKey];
					}
				});
			}
		});

		Object.keys(this.props).forEach((key) => {
			if (!(key in (this.instance.props ?? {}))) {
				delete this.props[key];
			}
		});
	}

	onBeforeCapture(fn) {
		this.beforeCapture.push(fn);
	}

	onBeforeRecord(fn) {
		this.beforeRecord.push(fn);
	}

	onAfterCapture(fn) {
		this.afterCapture.push(fn);
	}

	onAfterRecord(fn) {
		this.afterRecord.push(fn);
	}

	toJSON() {
		return {
			props: this.props,
			propsFolders: this.propsFolders.map(
				({
					id,
					displayName,
					depth,
					parent,
					collapsed,
					__initialCollapsed,
				}) => ({
					id,
					displayName,
					depth,
					collapsed,
					__initialCollapsed,
					parent: this.propsFolders.findIndex(
						(f) =>
							f.displayName === parent?.displayName &&
							f.depth === parent?.depth,
					),
				}),
			),
		};
	}

	get backgroundColor() {
		return this.instance.backgroundColor;
	}
}

export default Sketch;
