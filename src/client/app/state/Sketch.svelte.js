import { parseFolder } from '../utils/fields.utils';
import { rendering } from './rendering.svelte';
import {
	deepAssign,
	deepClone,
	deepEqual,
	hydrate,
	isDataURL,
	isFunction,
	isObject,
	persist,
} from './utils.svelte';

const noop = () => {};

/**
 * @typedef InstanceProp
 * @property {any} value
 * @property {Record<string, any>} params
 * @property {any[]} [triggers]
 * @property {string|undefined} [group]
 * @property {string|undefined} [type]
 * @property {string|undefined} [folder]
 * @property {string|null|undefined} [displayName]
 * @property {boolean|(() => boolean)} [hidden]
 * @property {boolean|(() => boolean)} [disabled]
 * @property {(prop: InstanceProp, context: { canvas: HTMLCanvasElement|null, width: number, height: number, pixelRatio: number }) => boolean} [onChange]
 */

/**
 * @typedef {Object} SketchInstance
 * @property {string} [rendering]
 * @property {any} [renderer]
 * @property {Record<string, InstanceProp>} [props]
 * @property {string} [name]
 * @property {number} [fps]
 * @property {() => boolean} [needsUpdate]
 * @property {number} [duration]
 * @property {string} [exportDir]
 * @property {string} [backgroundColor]
 * @property {() => Promise<void>} [load]
 * @property {(() => (void | Promise<void>))} [setup]
 * @property {(() => (void | Promise<void>))} [init]
 * @property {() => void} [draw]
 * @property {() => void} [update]
 * @property {(params: { width: number, height: number, pixelRatio: number }) => void} [resize]
 * @property {() => void} [dispose]
 * @property {import('../utils/canvas.utils').FilenamePattern} [filenamePattern]
 * @property {SketchBuildConfig} [buildConfig]
 */

/**
 * @typedef SketchProp
 * @property {any} value
 * @property {any} __initialValue
 * @property {any} __currentValue
 * @property {Record<string, any>} params
 * @property {any[]} triggers
 * @property {string|undefined} group
 * @property {string|undefined} type
 * @property {string|undefined} folder
 * @property {string|null|undefined} displayName
 * @property {boolean} hidden
 * @property {(() => boolean)} __hidden
 * @property {boolean} disabled
 * @property {(() => boolean)} __disabled
 */

/**
 * @typedef SketchPropFolder
 * @property {string} id
 * @property {string} [displayName]
 * @property {string} [rootId]
 * @property {(SketchPropFolder | { type: 'field', key: string })[]} children
 * @property {SketchPropFolder|undefined} parent
 * @property {'fieldgroup'} type
 * @property {number} depth
 * @property {boolean} collapsed
 * @property {boolean} hidden
 * @property {boolean} __initialCollapsed
 */

/**
 * @typedef {string} SketchPropGroup
 */

/**
 * @typedef {object} SketchBuildConfig
 * @property {string} [canvasSize]
 * @property {string} [resizing]
 * @property {[number, number]} [dimensions]
 * @property {number} [width]
 * @property {number} [height]
 * @property {number|(() => number)} [pixelRatio]
 * @property {number} [aspectRatio]
 * @property {string} [preset]
 * @property {string} [presetOrientation]
 * @property {number} [scale]
 * @property {string} [backgroundColor]
 * @property {string} [styles]
 * @property {{ headless?: boolean, resizable?: boolean, component?: () => Promise<{ default: import('svelte').Component }>, persistent?: boolean}} [layout]
 */

class Sketch {
	/** @type {Record<string, SketchProp>} */
	props = $state({});
	canvas = $state(null);
	backgroundColor = $state('inherit');
	/** @type {SketchPropGroup[]} */
	propsGroups = $state([]);
	/** @type {SketchPropFolder[]} */
	propsFolders = $state([]);
	version = $state(0);

	/**
	 *
	 * @param {object} params
	 * @param {string} params.key
	 * @param {SketchInstance} params.instance
	 * @param {Sketch} params.previous
	 */
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
		/** @type {SketchBuildConfig} */
		this.buildConfig = this.instance.buildConfig ?? {};

		this.recording = null;
		this.params = {};
		/** @type {import('./exports.svelte').CaptureListener[]} */
		this.beforeCapture = [];
		/** @type {import('./exports.svelte').RecordListener[]} */
		this.beforeRecord = [];
		/** @type {import('./exports.svelte').CaptureListener[]} */
		this.afterCapture = [];
		/** @type {import('./exports.svelte').RecordListener[]} */
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

	/**
	 *
	 * @param {Sketch} previous
	 */
	reconcile(previous) {
		const instanceProps = this.instance.props ?? {};
		/** @type {Record<string, SketchProp>} */
		const newProps = {};
		/** @type {SketchPropGroup[]} */
		const newPropsGroups = [];
		/** @type {SketchPropFolder[]} */
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

		/**
		 *
		 * @param {Record<string, SketchProp>} prevProps
		 */
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
							newProp.__currentValue = deepClone(
								$state.snapshot(newProp.value),
							);
						} else if (
							newProp.__initialValue === prevProp.__initialValue
						) {
							newProp.value = prevProp.value;
							newProp.__currentValue = deepClone(
								$state.snapshot(newProp.value),
							);
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

		/**
		 *
		 * @param {SketchPropFolder[]} prevFolders
		 */
		const restorePropsFoldersState = (prevFolders) => {
			/**
			 *
			 * @param {SketchPropFolder} prevFolder
			 */
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

	/**
	 *
	 * @param {Record<string, any>} target
	 * @param {string} key
	 * @param {InstanceProp} instanceProp
	 * @param {SketchPropFolder[]} propsFoldersCollection
	 * @param {SketchPropGroup[]} propsGroupsCollection
	 * @returns
	 */
	createProp(
		target,
		key,
		instanceProp,
		propsFoldersCollection,
		propsGroupsCollection,
	) {
		let {
			value,
			params = {},
			triggers = [],
			group,
			type,
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
		let __disabled =
			typeof instanceProp.disabled === 'function'
				? instanceProp.disabled
				: () => instanceProp.disabled;

		let initialValue = deepClone(value);

		if (group && !propsGroupsCollection.includes(group)) {
			propsGroupsCollection.push(group);
		}

		if (folder) {
			// this prevent references from breaking when using Proxies
			const propsFoldersCollectionCopy = [...propsFoldersCollection];
			this.createPropFolder(folder, propsFoldersCollectionCopy, key);
			propsFoldersCollection.length = 0;
			propsFoldersCollection.push(...propsFoldersCollectionCopy);
		}

		let prop = {
			value,
			__initialValue: initialValue,
			__currentValue: deepClone(value),
			__hidden,
			__disabled,
			hidden: __hidden(),
			disabled: __disabled(),
			type,
			params: structuredClone(params),
			triggers,
			group,
			folder,
			displayName,
		};

		target[key] = prop;

		return prop;
	}

	/**
	 *
	 * @param {string} key
	 * @param {any} newValue
	 */
	updateProp(key, newValue) {
		const prop = this.props[key];
		const instanceProp = this.instance.props?.[key];

		if (prop) {
			prop.value = newValue;
			prop.__currentValue = deepClone(newValue);
		}

		if (instanceProp) {
			if (!deepEqual(instanceProp.value, newValue)) {
				if (
					Array.isArray(instanceProp.value) &&
					Array.isArray(newValue)
				) {
					instanceProp.value.length = 0;
					instanceProp.value.push(...newValue);
				} else if (isObject(instanceProp.value) && isObject(newValue)) {
					deepAssign(instanceProp.value, newValue);
				} else {
					instanceProp.value = newValue;
				}
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
			this.props[key].disabled = this.props[key].__disabled();
		});

		this.version++;
	}

	/**
	 *
	 * @param {string} folder
	 * @param {SketchPropFolder[]} collection
	 * @param {string} key
	 * @returns {SketchPropFolder | undefined}
	 */
	createPropFolder(folder, collection, key) {
		if (!folder) return undefined;

		let propFolder;

		const parsed = parseFolder(folder);

		if (parsed.length > 0) {
			for (let i = 0; i < parsed.length; i++) {
				let match = parsed[i];
				let {
					depth,
					id,
					parentId,
					rootId,
					isCurrent,
					name,
					attributes,
				} = match;
				let { collapsed = false } = attributes ?? {};
				let displayName = name;

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
						rootId,
						hidden: false,
					};

					if (fieldgroup) {
						if (parent) {
							parent.children.push(fieldgroup);
						}
						collection.push(fieldgroup);
					}
				}

				if (
					fieldgroup &&
					isCurrent &&
					!fieldgroup.children.some(
						(c) => c.type === 'field' && c.key === key,
					)
				) {
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

	/**
	 *
	 * @param {SketchPropFolder} folder
	 * @param {boolean} collapsed
	 */
	updateFolder(folder, collapsed) {
		this.propsFolders.forEach((f, index) => {
			if (f.id === folder.id) {
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
		const instanceProps = this.instance.props ?? {};

		Object.keys(instanceProps).forEach((key) => {
			const instanceProp = instanceProps[key];
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
					prop.__initialValue = deepClone(
						$state.snapshot(prop.value),
					);
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
							(c) => c.type === 'field' && c.key === key,
						);
						fieldgroup.children.splice(childIndex, 1);

						/**
						 *
						 * @param {SketchPropFolder} fieldgroup
						 */
						const removeFolderIfNeeded = (fieldgroup) => {
							if (fieldgroup.children.length === 0) {
								const currentFolderIndex =
									this.propsFolders.findIndex(
										(c) => c.id === fieldgroup.id,
									);
								this.propsFolders.splice(currentFolderIndex, 1);

								if (fieldgroup && fieldgroup.parent) {
									const { parent } = fieldgroup;
									const childIndex =
										parent.children.findIndex(
											(c) =>
												c.type === 'fieldgroup' &&
												c.id === fieldgroup.id,
										);
									parent.children.splice(childIndex, 1);
									removeFolderIfNeeded(fieldgroup.parent);
								}
							}
						};

						removeFolderIfNeeded(fieldgroup);
					}

					if (instanceProp.folder) {
						// this prevent references from breaking when using Proxies
						const propsFoldersCopy = [...this.propsFolders];
						this.createPropFolder(
							instanceProp.folder,
							propsFoldersCopy,
							key,
						);
						this.propsFolders = propsFoldersCopy;
						prop.folder = instanceProp.folder;
					} else {
						prop.folder = undefined;
					}
				}

				// sync hidden
				prop.hidden = prop.__hidden();
				// sync disabled state
				prop.disabled = prop.__disabled();

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

		const fieldgroups = [...this.propsFolders].sort(
			(a, b) => b.depth - a.depth,
		);

		fieldgroups.forEach((fieldgroup) => {
			const hasAllFieldsHidden = fieldgroup.children
				.filter((child) => child.type === 'field')
				.every((child) => this.props[child.key]?.__hidden());
			const hasAllFieldgroupsHidden = fieldgroup.children
				.filter((child) => child.type === 'fieldgroup')
				.every((child) => child.hidden);

			if (hasAllFieldsHidden && hasAllFieldgroupsHidden) {
				if (!fieldgroup.hidden) {
					fieldgroup.hidden = true;
				}
			} else {
				if (fieldgroup.hidden) {
					fieldgroup.hidden = false;
				}
			}
		});
	}

	/**
	 * @param {import('./exports.svelte').CaptureListener} fn
	 */
	onBeforeCapture(fn) {
		this.beforeCapture.push(fn);
	}

	/**
	 *
	 * @param {import('./exports.svelte').RecordListener} fn
	 */
	onBeforeRecord(fn) {
		this.beforeRecord.push(fn);
	}

	/**
	 * @param {import('./exports.svelte').CaptureListener} fn
	 */
	onAfterCapture(fn) {
		this.afterCapture.push(fn);
	}

	/**
	 * @param {import('./exports.svelte').RecordListener} fn
	 */
	onAfterRecord(fn) {
		this.afterRecord.push(fn);
	}

	toJSON() {
		/**
		 * @typedef SketchPropJSON
		 * @property {any} value
		 * @property {Record<string, any>} params
		 * @property {any[]} triggers
		 * @property {any} __initialValue
		 * @property {any} __currentValue
		 */
		/** @type {Record<string, SketchPropJSON>} */
		const props = {};

		for (const key in this.props) {
			const prop = this.props[key];

			props[key] = {
				value: isDataURL(prop.value) ? prop.__initialValue : prop.value,
				params: prop.params,
				triggers: prop.triggers,
				__initialValue: prop.__initialValue,
				__currentValue: prop.__currentValue,
			};
		}

		return {
			props,
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
}

export default Sketch;
