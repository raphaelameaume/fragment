import path from 'node:path';
import fs from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createTsConfigFile } from './createFragmentFile.js';
import { log, magenta, bold, cyan, dim } from './log.js';
import * as p from './prompts.js';
import {
	packageManager,
	__dirname,
	file,
	mkdirp,
	handleCancelledPrompt,
	prettifyTime,
	addExtension,
} from './utils.js';

/**
 * @typedef TemplateOption
 * @property {string} name
 * @property {string} description
 * @property {string[]} [dependencies]
 * @property {string} path
 * @property {string} label
 * @property {string} hint
 * @property {string} value
 * @property {boolean} [isDefault=false]
 */

/**
 * Create a new sketch
 * @param {string} entry
 * @param {object} [options]
 * @param {string} [options.templateName]
 * @param {boolean} [options.typescript]
 */
export async function create(entry, { templateName, typescript } = {}) {
	const cwd = process.cwd();
	const prefix = log.prefix('create');

	try {
		log.message(`${magenta(entry)}\n`, prefix);

		/** @type {string |undefined} */
		let dir;
		/** @type {string |undefined} */
		let name;

		if (entry) {
			const { dir: entryDir, base: entryBase } = path.parse(entry);

			dir = entryDir;
			name = entryBase;
		}

		const outDirResult = await p.text({
			message: 'Specify an output directory:',
			placeholder: '.',
			hint: '(hit Enter to use current directory)',
			initialValue: dir,
			defaultValue: '.',
		});

		handleCancelledPrompt(outDirResult, prefix);

		dir = outDirResult;

		if (!dir) {
			dir = cwd;
		}

		const answerName = await p.text({
			message: 'Specify a sketch name:',
			placeholder: `  `,
			hint: '(hit Enter to validate)',
			initialValue: name,
			validate: (value) => {
				if (!value || value.length === 0) return `A name is required.`;

				return undefined;
			},
		});

		handleCancelledPrompt(answerName, prefix);

		name = (answerName ?? '').replace(/\s/g, '-');

		/** @type {TemplateOption[]} */
		let templatesOptions = fs
			.readdirSync(file('./templates'))
			.map((dir) => {
				const dirpath = file(`./templates/${dir}`);
				const metadata = path.join(dirpath, 'meta.json');
				const template = JSON.parse(fs.readFileSync(metadata, 'utf8'));

				return {
					...template,
					path: dir,
					// for prompts
					label: template.name,
					hint: template.description,
					value: template.name,
				};
			});

		// put default template in the first place
		templatesOptions = templatesOptions.sort(
			(a, b) =>
				Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)),
		);

		const templateNameAnswer = await p.select({
			message: 'Pick a template:',
			options: templatesOptions,
			initialValue: templatesOptions.find(
				(option) => templateName === option.name,
			)?.value,
		});

		handleCancelledPrompt(templateNameAnswer, prefix);

		templateName = String(templateNameAnswer);

		const typescriptAnswer = await p.confirm({
			message: 'Use TypeScript template?',
			active: 'Yes',
			inactive: 'No',
			initialValue: typescript ?? path.extname(name) === '.ts',
		});

		handleCancelledPrompt(typescriptAnswer, prefix);
		typescript = typescriptAnswer;

		const template = templatesOptions.find(
			(option) => option.value === templateName,
		);

		if (!template) {
			throw new Error(`Template "${templateName}" not found.`);
		}

		const dependencies = template.dependencies ?? [];
		const hasDependencies = dependencies.length > 0;
		const singleDependency = dependencies.length === 1;

		if (hasDependencies) {
			const dependenciesList = dependencies
				.map((dependency) => bold(`${dependency}`))
				.join(',');

			log.warn(
				`This template has the following ${singleDependency ? 'dependency' : 'dependencies'}: ${dependenciesList}. ${singleDependency ? 'It' : 'They'} need${singleDependency ? 's' : ''} to be installed before running Fragment.\n`,
			);
		}

		mkdirp(dir);

		const from = file(`./templates/${template.path}`);
		const to = dir;

		let excludes = [
			...(typescript ? ['index.js'] : ['index.ts']),
			'meta.json',
		];

		let filename = path.basename(name).split('.')[0];
		let templateFiles = await readdir(from);

		templateFiles = templateFiles.filter(
			(file) => !excludes.includes(file),
		);

		let startTime = Date.now();
		log.message(
			`Creating sketch from template ${magenta(template.name)}...\n`,
			prefix,
		);

		/**
		 * Resolve a destination path, asking the user what to do if it already exists.
		 * @param {string} filepath
		 * @param {boolean} [skip=false] return an empty string instead of asking for another name
		 * @returns {Promise<string>}
		 */
		const checkForFileExistence = async (filepath, skip = false) => {
			if (fs.existsSync(filepath)) {
				const dirname = path.dirname(filepath);
				const ext = path.extname(filepath);

				const existingName = path.basename(filepath);

				log.warn(`${existingName} already exists.\n`);

				const override = await p.confirm({
					message: `Override ${existingName}?`,
					active: 'Yes',
					inactive: 'No',
					initialValue: false,
				});

				handleCancelledPrompt(override, prefix);

				if (!override) {
					if (skip) return '';

					const newNameAnswer = await p.text({
						message: 'Pick a different name:',
						placeholder: `  `,
						hint: '(hit Enter to validate)',
						initialValue: existingName,
						validate: (value) => {
							if (!value || value.length === 0) {
								return `A name is required.`;
							}

							return undefined;
						},
					});

					handleCancelledPrompt(newNameAnswer, prefix);

					return await checkForFileExistence(
						path.join(
							dirname,
							addExtension(
								(newNameAnswer ?? '').replace(/\s/g, '-'),
								ext,
							),
						),
					);
				}

				return filepath;
			}

			return filepath;
		};

		/** @type {string[]} */
		const newFiles = [];

		for (let i = 0; i < templateFiles.length; i++) {
			const file = templateFiles[i];
			const source = path.join(from, file);
			const ext = path.extname(source);

			let dest = path.join(to, `${filename}${ext}`);

			log.info(
				`Copying templates/${template.path}/${file} to ${path.relative(cwd, dest)}...`,
			);

			dest = await checkForFileExistence(dest);
			filename = path.parse(dest).name;

			let buffer = await readFile(source);
			let content = buffer.toString();

			// replace references to template files by new files paths
			templateFiles.forEach((templateFile, index) => {
				if (index === i) return;

				const newFile = newFiles[index];

				if (!newFile) return;

				content = content.replace(
					new RegExp(
						templateFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
						'g',
					),
					`${path.basename(newFile)}`,
				);
			});

			await writeFile(dest, Buffer.from(content));

			log.success(
				`Copied templates/${template.path}/${file} to ${path.relative(cwd, dest)}\n`,
			);

			newFiles.push(dest);
		}

		if (typescript) {
			let dest = path.join(cwd, `tsconfig.json`);

			log.info(`Creating tsconfig.json in ${dest}...`);

			dest = await checkForFileExistence(dest, true);

			if (dest) {
				const fragmentTsConfigPath = await createTsConfigFile(cwd);

				const tsConfigCode = `
// Generated by Fragment.
{
  // https://github.com/raphaelameaume/fragment
  "extends": "./${path.relative(path.dirname(dest), fragmentTsConfigPath)}",
  "compilerOptions": {
    "types": ["${path.relative(path.dirname(dest), path.join(__dirname, 'src/types/client.d.ts'))}"]
  }
}
`;

				await writeFile(dest, tsConfigCode);

				log.success(`Created tsconfig.json in ${dest}\n`);
			}
		}

		log.success(
			`Done in ${prettifyTime(Date.now() - startTime)}\n`,
			prefix,
		);
		log.info(`${newFiles.join('\n')}\n`);

		let i = 1;

		let nextSteps = ``;

		if (hasDependencies) {
			nextSteps += `${dim(`${i++}. Install dependencies`)}\n${bold(cyan(`${packageManager} install ${dependencies.join(' ')}`))}\n\n`;
		}

		const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`${escapedFilename}\\.(js|ts)$`);
		const newIndexFile = newFiles.findLast((file) => regex.test(file));

		nextSteps += `${dim(`${i++}. Start Fragment`)}\n${bold(cyan(`fragment ${path.relative(cwd, newIndexFile ?? entry)}`))}`;

		p.note(nextSteps, 'Next steps');
	} catch (error) {
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
