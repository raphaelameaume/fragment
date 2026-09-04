import path from 'node:path';
import { log } from '../log.js';

/**
 * A single component registered via {@link FragmentPlugin.registerModules}.
 *
 * @typedef {Object} ModuleRegistration
 * @property {string} name
 *   Unique key this module will be exposed under in `configModulesList`.
 * @property {string} component
 *   Absolute filesystem path to the component file. Plugin authors should
 *   compute this themselves (e.g. via `import.meta.url`) rather than
 *   passing a bare relative/package specifier, so resolution doesn't
 *   depend on the consuming project's `cwd`.
 */

/**
 * A single input type registered via {@link FragmentPlugin.inputs}.
 *
 * @typedef {Object} InputRegistration
 * @property {string} type
 *   Unique key this input will be exposed under in `configInputsList`.
 * @property {string} input
 *   Absolute filesystem path to the JS module exporting this Fragment
 *   Input definition (not a Svelte component).
 * @property {string} [triggers]
 *   Optional absolute filesystem path to a companion "triggers" Svelte
 *   component for this input type.
 */

/**
 * The shape a Fragment plugin factory must return.
 *
 * @typedef {Object} FragmentPlugin
 * @property {string} name
 *   Plugin name, used in error messages when collisions are detected.
 * @property {() => ModuleRegistration[]} [modules]
 *   Returns the modules this plugin contributes (consistent with Fragment's
 *   existing module vocabulary, e.g. monitor/midi/params).
 * @property {() => InputRegistration[]} [inputs]
 *   Returns the input types this plugin contributes.
 */

/**
 * @typedef {Object} FragmentConfig
 * @property {FragmentPlugin[]} [plugins]
 */

/**
 * @typedef {Object} PluginFactoryOptions
 * @property {string} cwd
 *   Project root. No longer used for path resolution (plugins resolve
 *   their own absolute paths), but kept for forward compatibility /
 *   other uses within the plugin.
 * @property {FragmentConfig} config
 */

/**
 * Internal bookkeeping for a single resolved module registration, after
 * an alias has been assigned and the source has been de-duplicated.
 *
 * @typedef {Object} ResolvedModule
 * @property {string} moduleFilepath
 * @property {string} moduleName
 * @property {string} moduleAlias
 */

/**
 * Internal bookkeeping for a single resolved input registration.
 *
 * @typedef {Object} ResolvedInput
 * @property {string} inputFilepath
 * @property {string} inputType
 * @property {string} inputAlias
 * @property {string} [inputFilepathTriggers]
 * @property {string} [inputAliasTriggers]
 */

/**
 * Turns an absolute filesystem path into a JS string literal that's safe
 * to splice into generated source (handles quotes and Windows backslashes
 * correctly, unlike manual `'${path}'` interpolation).
 *
 * @param {string} filepath
 * @returns {string}
 */
function toImportSpecifier(filepath) {
	return JSON.stringify(filepath);
}

/**
 * Builds a `virtual:config-modules` / `virtual:config-inputs` pair from the
 * `modules()` / `inputs()` contributions of every plugin in
 * `config.plugins`, statically importing each so `configModulesList` and
 * `configInputsList` resolve synchronously for consumers like `Inputs.js`
 * and `ModuleRenderer.svelte`.
 *
 * @param {PluginFactoryOptions} options
 * @returns {import('vite').Plugin}
 */
export default function pluginLoader({ config }) {
	const { plugins = [] } = config;

	/** @type {ResolvedModule[]} */
	const configModules = [];
	/** @type {ResolvedInput[]} */
	const inputConfigs = [];

	// name -> owning plugin name, for collision error messages
	/** @type {Map<string, string>} */
	const seenModuleNames = new Map();
	/** @type {Map<string, string>} */
	const seenInputTypes = new Map();

	plugins.forEach((plugin, pluginIndex) => {
		log.info(`Loading ${plugin.name ?? 'plugin'} from configuration`);

		const modules = plugin.modules?.() ?? [];
		modules.forEach((m, moduleIndex) => {
			if (seenModuleNames.has(m.name)) {
				throw new Error(
					`Fragment: module name '${m.name}' registered by both ` +
						`'${seenModuleNames.get(m.name)}' and '${plugin.name}'. ` +
						`Module names must be unique across all plugins.`,
				);
			}
			seenModuleNames.set(m.name, plugin.name);

			const moduleFilepath = path.resolve(m.component);
			const moduleAlias = `ConfigModule_${pluginIndex}_${moduleIndex}`;

			configModules.push({
				moduleFilepath,
				moduleName: m.name,
				moduleAlias,
			});
		});

		const inputs = plugin.inputs?.() ?? [];
		inputs.forEach((m, inputIndex) => {
			if (seenInputTypes.has(m.type)) {
				throw new Error(
					`Fragment: input type '${m.type}' registered by both ` +
						`'${seenInputTypes.get(m.type)}' and '${plugin.name}'. ` +
						`Input types must be unique across all plugins.`,
				);
			}
			seenInputTypes.set(m.type, plugin.name);

			const { triggers } = m;
			const inputFilepath = path.resolve(m.input);
			const inputFilepathTriggers = triggers
				? path.resolve(triggers)
				: undefined;

			const inputAlias = `ConfigInput_${pluginIndex}_${inputIndex}`;
			const inputAliasTriggers = triggers
				? `ConfigInputTriggers_${pluginIndex}_${inputIndex}`
				: undefined;

			inputConfigs.push({
				inputFilepath,
				inputType: m.type,
				inputAlias,
				inputFilepathTriggers,
				inputAliasTriggers,
			});
		});
	});

	const virtualModuleId = 'virtual:config-modules';
	const virtualInputsId = 'virtual:config-inputs';
	const resolvedVirtualModuleId = '\0' + virtualModuleId;
	const resolvedVirtualInputsId = '\0' + virtualInputsId;

	return {
		name: 'fragment-plugin-config-plugins',
		resolveId(id) {
			if (id === virtualModuleId) return resolvedVirtualModuleId;
			if (id === virtualInputsId) return resolvedVirtualInputsId;
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				const importLines = configModules
					.map(
						({ moduleAlias, moduleFilepath }) =>
							`import ${moduleAlias} from ${toImportSpecifier(moduleFilepath)};`,
					)
					.join('\n');

				const listEntries = configModules
					.map(
						({ moduleName, moduleAlias }) =>
							`\t'${moduleName}': ${moduleAlias}`,
					)
					.join(',\n');

				return `
${importLines}

export const configModulesNames = [
${configModules.map(({ moduleName }) => `\t'${moduleName}'`).join(',\n')}
];

/** Map of module name -> the module's component. */
export const configModulesList = {
${listEntries}
};

export default {};
`;
			}

			if (id === resolvedVirtualInputsId) {
				const importLines = inputConfigs
					.map(
						({ inputAlias, inputFilepath }) =>
							`import ${inputAlias} from ${toImportSpecifier(inputFilepath)};`,
					)
					.join('\n');

				const triggerImportLines = inputConfigs
					.filter(({ inputAliasTriggers }) => inputAliasTriggers)
					.map(
						({ inputAliasTriggers, inputFilepathTriggers }) =>
							`import ${inputAliasTriggers} from ${toImportSpecifier(
								/** @type {string} */ (inputFilepathTriggers),
							)};`,
					)
					.join('\n');

				const inputEntries = inputConfigs
					.map(
						({ inputType, inputAlias }) =>
							`\t'${inputType}': ${inputAlias}`,
					)
					.join(',\n');

				const triggerEntries = inputConfigs
					.filter(({ inputAliasTriggers }) => inputAliasTriggers)
					.map(
						({ inputType, inputAliasTriggers }) =>
							`\t'${inputType}': ${inputAliasTriggers}`,
					)
					.join(',\n');

				return `
${importLines}
${triggerImportLines}

/** Map of input type -> the input's definition/component. */
export const configInputsList = {
${inputEntries}
};

/** Map of input type -> its triggers component, for types that have one. */
export const configInputsTriggerList = {
${triggerEntries}
};
`;
			}
		},
	};
}
