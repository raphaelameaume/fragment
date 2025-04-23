import path from 'node:path';

export default function ({ cwd, config }) {
	const { plugins = [] } = config;
	const configModules = [];

	plugins.forEach((plugin) => {
		if (typeof plugin.registerModules === 'function') {
			const modules = plugin.registerModules() ?? [];

			modules.forEach((m) => {
				const moduleFilepath = path.join(cwd, m.component);
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
		}
	});

	const virtualModuleId = 'virtual:config-modules';
	const resolvedVirtualModuleId = '\0' + virtualModuleId;

	const configModulesNames = [];

	return {
		name: 'fragment-plugin-dynamic-modules',
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
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
		},
	};
}
