import path from 'node:path';
import fs from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { log, magenta, bold, cyan, dim } from './log.js';
import * as p from './prompts.js';
import {
	packageManager,
	file,
	mkdirp,
	handleCancelledPrompt,
	prettifyTime,
} from './utils.js';

/**
 * Create a new sketch
 * @param {string} entry
 * @param {object} options
 * @param {string} options.templateName
 */
export async function create(entry, { templateName } = {}) {
	const cwd = process.cwd();
	const prefix = log.prefix('create');

	const addExtension = (name, ext) => {
		if (path.extname(name) === '') {
			return `${name}${ext}`;
		}

		return name;
	};

	try {
		log.message(`${magenta(entry)}\n`, prefix);

		let dir, name;

		if (entry) {
			const { dir: entryDir, base: entryBase } = path.parse(entry);

			dir = entryDir;
			name = entryBase;
		}

		dir = await p.text({
			message: 'Specify an output directory:',
			placeholder: '.',
			hint: '(hit Enter to use current directory)',
			initialValue: dir,
		});

		handleCancelledPrompt(dir, prefix);

		if (!dir) {
			dir = cwd;
		}

		name = await p.text({
			message: 'Specify a sketch name:',
			placeholder: `  `,
			hint: '(hit Enter to validate)',
			initialValue: name,
			validate: (value) => {
				if (value.length === 0) return `A name is required.`;
			},
		});

		handleCancelledPrompt(name, prefix);

		name = name.replace(/\s/g, '-');

		let templatesOptions = fs
			.readdirSync(file('./templates'))
			.map((dir) => {
				const metadata = file(`./templates/${dir}/meta.json`);
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
		templatesOptions = templatesOptions.sort((a, b) =>
			a.isDefault ? -1 : 1,
		);

		templateName = await p.select({
			message: 'Pick a template:',
			options: templatesOptions,
			initialValue: templatesOptions.find(
				(option) => templateName === option.name,
			)?.value,
		});

		handleCancelledPrompt(templateName, prefix);

		let template = templatesOptions.find(
			(option) => option.value === templateName,
		);

		const hasDependencies = template.dependencies?.length > 0;
		const singleDependency = template.dependencies?.length === 1;

		if (hasDependencies) {
			const dependenciesList = template.dependencies
				.map((dependency) => bold(`${dependency}`))
				.join(',');

			log.warn(
				`This template has the following ${singleDependency ? 'dependency' : 'dependencies'}: ${dependenciesList}. ${singleDependency ? 'It' : 'They'} need${singleDependency ? 's' : ''} to be installed before running Fragment.\n`,
			);
		}

		mkdirp(dir);

		const from = file(`./templates/${template.path}`);
		const to = dir;

		let filename = path.basename(name).split('.')[0];
		let excludes = ['meta.json'];
		let templateFiles = await readdir(from);

		templateFiles = templateFiles.filter(
			(file) => !excludes.includes(file),
		);

		let startTime = Date.now();
		log.message(
			`Creating sketch from template ${magenta(template.name)}...\n`,
			prefix,
		);

		const checkForFileExistence = async (filepath) => {
			if (fs.existsSync(filepath)) {
				const dirname = path.dirname(filepath);
				const ext = path.extname(filepath);

				let filename = path.basename(filepath);

				log.warn(`${filename} already exists in ${dirname}.\n`);

				let override = await p.confirm({
					message: `Override ${filename}?`,
					active: 'Yes',
					inactive: 'No',
					initialValue: false,
				});

				handleCancelledPrompt(override, prefix);

				if (!override) {
					filename = await p.text({
						message: 'Pick a different name:',
						placeholder: `  `,
						hint: '(hit Enter to validate)',
						initialValue: filename,
						validate: (value) => {
							if (value.length === 0)
								return `A name is required.`;
						},
					});

					handleCancelledPrompt(filename, prefix);

					filename = filename.replace(/\s/g, '-');

					return await checkForFileExistence(
						path.join(dirname, addExtension(filename, ext)),
					);
				}

				return filepath;
			}

			return filepath;
		};

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

			let buffer = await readFile(source);
			let content = buffer.toString();

			// replace references to template files by new files paths
			templateFiles.forEach((templateFile, index) => {
				if (index === i) return;

				if (newFiles.length > 0) {
					const newFile = newFiles[index];

					content = content.replace(
						new RegExp(templateFile, 'g'),
						`${path.basename(newFile)}`,
					);
				}
			});

			await writeFile(dest, Buffer.from(content));

			log.success(
				`Copied templates/${template.path}/${file} to ${path.relative(cwd, dest)}\n`,
			);

			newFiles.push(dest);
		}

		log.success(
			`Done in ${prettifyTime(Date.now() - startTime)}\n`,
			prefix,
		);
		log.info(`${newFiles.join('\n')}\n`);

		let i = 1;

		let nextSteps = ``;

		if (hasDependencies) {
			nextSteps += `${dim(`${i++}. Install dependencies`)}\n${bold(cyan(`${packageManager} install ${template.dependencies.join(' ')}`))}\n\n`;
		}

		nextSteps += `${dim(`${i++}. Start Fragment`)}\n${bold(cyan(`fragment ${path.relative(cwd, newFiles[newFiles.length - 1])}`))}`;

		p.note(nextSteps, 'Next steps');
	} catch (error) {
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
