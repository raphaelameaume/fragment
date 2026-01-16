#!/usr/bin/env node

import fs from 'node:fs';
import sade from 'sade';
import { grey } from 'kleur/colors';
import { run } from '../src/cli/run.js';
import { build } from '../src/cli/build.js';
import { create } from '../src/cli/create.js';
import { preview } from '../src/cli/preview.js';

const { version } = JSON.parse(
	fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
);

console.log(`${grey(`[fragment] v${version}`)}\n`);

const prog = sade('fragment');
prog.version(`${version}`);

prog.command('run [entry]', '', { default: true })
	.describe('Run an existing sketch')
	.option('-n, --new', 'Redirect to create workflow', false)
	.option('-t, --template', 'Pre-populate template choice in create prompts', '2d')
	.option('--typescript', 'Pre-populate TypeScript support choice in create prompts')
	.option('-b, --build', 'Redirect to build workflow', false)
	.option('-dev, --development', 'Run Fragment in development mode', false)
	.option('--outDir', 'Pre-populate outDir in build prompts')
	.option('--emptyOutDir', 'Pre-populate emptyOutDir in build prompts')
	.option('--base', 'Pre-populate base path in build prompts')
	.option('--prompts', 'Toggle interactive prompts in build prompts')
	.option('-p, --port', 'Specify the server port')
	.option('-o, --open', 'Flag to open the application in the browser when the server starts')
	.option('--exportDir', 'Override directory used for exports')
	.option('--config', 'Path to Fragment config file')
	.action((entry, options) => {
		if (options.new) {
			return create(entry, {
				templateName: options.template,
				typescript: options.typescript,
				configFilepath: options.config,
			});
		}

		if (options.build) {
			return build(entry, {
				development: options.development,
				outDir: options.outDir,
				emptyOutDir: options.emptyOutDir,
				base: options.base,
				prompts: options.prompts,
				configFilepath: options.config,
			});
		}

		run(entry, {
			development: options.development,
			port: options.port,
			open: options.open,
			exportDir: options.exportDir,
			configFilepath: options.config,
		});
	});

prog.command('create [entry]')
	.describe('Create a new sketch')
	.option('-t, --template', 'Pre-populate template choice', '2d')
	.option('--typescript', 'Pre-populate TypeScript support choice')
	.option('--config', 'Path to Fragment config file')
	.action((entry = '', options) => {
		create(entry, {
			templateName: options.template,
			typescript: options.typescript,
			configFilepath: options.config,
		});
	});

prog.command('build [entry]')
	.describe('Build a sketch into static files for production')
	.option('-dev, --development', 'Enable development mode', false)
	.option('--outDir', 'Pre-populate out directory')
	.option('--emptyOutDir', 'Pre-populate flag to empty outDir before static build')
	.option('--base', 'Base public path when served in production')
	.option('--prompts', 'Toggle interactive prompts')
	.option('--config', 'Path to Fragment config file')
	.action((entry, options) => {
		build(entry, {
			development: options.development,
			outDir: options.outDir,
			emptyOutDir: options.emptyOutDir,
			base: options.base,
			prompts: options.prompts,
			configFilepath: options.config,
		});
	});

prog.command('preview [directory]')
	.describe('Preview a sketch')
	.option('-p, --port', 'Specify the server port')
	.option('-o, --open', 'Flag to open the application in the browser when the server starts')
	.option('--config', 'Path to Fragment config file')
	.action((dir, options) => {
		preview(dir, {
			port: options.port,
			open: options.open,
			configFilepath: options.config,
		});
	});

prog.parse(process.argv);
