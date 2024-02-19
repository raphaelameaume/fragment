import path from 'node:path';
import fs from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { bold, cyan, grey, white, yellow, green } from 'kleur/colors';
import * as p from '@clack/prompts';
import {
	packageManager,
	file,
	mkdirp,
	handleCancelledPrompt,
} from './utils.js';

/**
 * Create a new sketch
 * @param {string} entry
 * @param {object} options
 * @param {string} options.templateName
 */
export async function create(entry, { templateName } = {}) {
	const cwd = process.cwd();

	const addExtension = (name) => {
		if (path.extname(name) === '') {
			return `${name}.js`;
		}

		return name;
	};

	p.intro(`Welcome to Fragment!`);

	let dir, name;

	if (entry) {
		const { dir: entryDir, base: entryBase } = path.parse(entry);

		dir = entryDir;
		name = entryBase;
	}

	dir = await p.text({
		message: 'Where should we create your sketch?',
		placeholder: '.  (hit Enter to use current directory)',
		initialValue: dir,
	});

	handleCancelledPrompt(dir);

	if (!dir) {
		dir = cwd;
	}

	name = await p.text({
		message: 'What is the name of your sketch file?',
		placeholder: `  (hit Enter to validate)`,
		initialValue: name,
		validate: (value) => {
			if (value.length === 0) return `A name is required.`;
		},
	});

	handleCancelledPrompt(name);

	name = name.replace(/\s/g, '-');

	const checkForFileExistence = async () => {
		if (fs.existsSync(path.join(dir ?? cwd, addExtension(name)))) {
			p.log.warn(yellow(`${name} already exists in ${dir ?? cwd}.`));

			let override = await p.confirm({
				message: `Do you want to override ${addExtension(name)}?`,
				active: 'Yes',
				inactive: 'No',
				initialValue: false,
			});

			handleCancelledPrompt(override);

			if (!override) {
				name = await p.text({
					message: 'Pick a different sketch name',
					placeholder: `  (hit Enter to validate)`,
					initialValue: name,
					validate: (value) => {
						if (value.length === 0) return `A name is required.`;
					},
				});

				await checkForFileExistence();
			}
		}
	};

	await checkForFileExistence();

	let templatesOptions = fs.readdirSync(file('./templates')).map((dir) => {
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
	templatesOptions = templatesOptions.sort((a, b) => (a.isDefault ? -1 : 1));

	templateName = await p.select({
		message: 'Pick a Fragment template:',
		options: templatesOptions,
		initialValue: templatesOptions.find(
			(option) => templateName === option.name,
		)?.value,
	});

	handleCancelledPrompt(templateName);

	let template = templatesOptions.find(
		(option) => option.value === templateName,
	);

	mkdirp(dir);

	const from = file(`./templates/${template.path}`);
	const to = dir;

	let filename = path.basename(name).split('.')[0];
	let excludes = ['meta.json'];
	let templateFiles = await readdir(from);

	templateFiles = templateFiles.filter((file) => !excludes.includes(file));

	const files = [];

	p.log.step(`Create sketch from template: ${white(template.name)}`);

	let index = 0;

	for (let i = 0; i < templateFiles.length; i++) {
		const file = templateFiles[i];
		const source = path.join(from, file);

		const ext = path.extname(source);

		const composeFilename = () => {
			if (index > 0) {
				return `${filename}-${`${index}`.padStart(2, '0')}${ext}`;
			}

			return `${filename}${ext}`;
		};

		let dest = path.join(to, composeFilename());

		let attempts = 0;
		let maxAttempts = 100;

		const checkForFileExistence = async () => {
			p.log.message(
				grey(
					`Copying templates/${template.path}/${file} to ${path.relative(cwd, dest)}...`,
				),
			);
			if (fs.existsSync(dest)) {
				attempts++;
				index++;

				p.log.message(yellow(`File already exists. Retrying...`));

				dest = path.join(to, composeFilename());

				if (attempts < maxAttempts) {
					checkForFileExistence();
				} else {
					dest = path.join(to, `${filename}-${Date.now()}${ext}`);
				}
			}
		};

		checkForFileExistence();

		let buffer = await readFile(source);
		let content = buffer.toString();

		templateFiles
			.filter((f) => f !== file)
			.forEach((f) => {
				content = content.replace(
					new RegExp(f, 'g'),
					`${filename}${path.extname(f)}`,
				);
			});

		await writeFile(dest, Buffer.from(content));
		files.push(dest);
	}

	p.log.success(`Sketch created from template: ${white(template.name)}`);

	p.log.message(
		`${files.map((file) => `- ${path.relative(cwd, file)}`).join('\n')}`,
	);

	const hasDependencies = template.dependencies?.length > 0;
	const singleDependency = template.dependencies?.length === 1;

	let i = 1;

	if (hasDependencies) {
		p.log.warn(
			yellow(
				`This template has the following ${singleDependency ? 'dependency' : 'dependencies'}: ${template.dependencies.map((dependency) => bold(`${dependency}`)).join(',')}. ${singleDependency ? 'It' : 'They'} need${singleDependency ? 's' : ''} to be installed before running Fragment.`,
			),
		);
	}

	let nextSteps = ``;

	if (hasDependencies) {
		nextSteps += `${i++}. Install dependencies\n${bold(cyan(`${packageManager} install ${template.dependencies.join(' ')}`))}\n\n`;
	}

	nextSteps += `${i++}. Start Fragment\n${bold(cyan(`fragment ${entry}`))}`;

	p.note(nextSteps, `Next steps`);

	p.outro(`${green(`✔ Completed`)}`);
}
