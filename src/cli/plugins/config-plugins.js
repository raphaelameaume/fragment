import path from 'node:path';

export default function ({ cwd, config }) {
	const { plugins = [] } = config;
	const configModules = [];
	const inputConfigs = [];

	plugins.forEach((plugin) => {
		const modules = plugin.registerModules?.() ?? [];

		modules.forEach((m) => {
			const moduleFilepath = path.resolve(m.component);
			const moduleName = m.name;
			const moduleAlias = `${moduleName}ConfigModule`;
			const moduleImport = `import ${moduleAlias} from '${moduleFilepath}';\n`;
			const configModule = {
				moduleFilepath,
				moduleImport,
				moduleName,
				moduleAlias,
			};

			configModules.push(configModule);
		});

		const inputs = plugin.registerInputs?.() ?? [];

		inputs.forEach((m) => {
			const inputFilepath = path.join(cwd, m.filepath);
			const { triggersComponent } = m;
			const inputFilepathTriggers = triggersComponent
				? path.join(cwd, m.triggersComponent)
				: undefined;
			const inputType = m.type;
			const inputAlias = `ConfigInput${inputType}`;
			const inputAliasTriggers = triggersComponent
				? `ConfigInput${inputType}Triggers`
				: undefined;
			const inputImport = `import ${inputAlias} from '${inputFilepath}';\n`;
			const inputImportTriggers = triggersComponent
				? `import ${inputAliasTriggers} from '${inputFilepathTriggers}';\n`
				: undefined;
			const inputConfig = {
				inputFilepath,
				inputImport,
				inputType,
				inputImportTriggers,
				inputAlias,
				inputAliasTriggers,
			};

			inputConfigs.push(inputConfig);
		});
	});

	const virtualModuleId = 'virtual:config-modules';
	const virtualInputsId = 'virtual:config-inputs';

	const resolvedVirtualModuleId = '\0' + virtualModuleId;
	const resolvedVirtualInputsId = '\0' + virtualInputsId;

	return {
		name: 'fragment-plugin-config-plugins',
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}

			if (id === virtualInputsId) {
				return resolvedVirtualInputsId;
			}
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				return `
				${configModules.map(({ moduleImport }) => moduleImport)}

				export const configModulesNames = [
					${configModules.map(({ moduleName }) => `'${moduleName}'`).join(',\n')}
				];

				export const configModulesList = {
					${configModules.map(({ moduleName, moduleAlias }) => `'${moduleName}': ${moduleAlias}`).join(',\n')}
				};

				export default {};
				`;
			}

			if (id === resolvedVirtualInputsId) {
				return `
				${inputConfigs.map(({ inputImport }) => inputImport)}
				${inputConfigs.filter(({ inputImportTriggers }) => inputImportTriggers).map(({ inputImportTriggers }) => inputImportTriggers)}

				export const configInputsList = {
					${inputConfigs.map(({ inputType, inputAlias }) => `'${inputType}': ${inputAlias}`).join(',\n')}
				};

				export const configInputsTriggerList = {
					${inputConfigs
						.filter(
							({ inputImportTriggers }) => inputImportTriggers,
						)
						.map(
							({ inputType, inputAliasTriggers }) =>
								`'${inputType}': ${inputAliasTriggers}`,
						)
						.join(',\n')}
				};
				`;
			}
		},
	};
}
