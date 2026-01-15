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
	.describe('Run a dev environment for fragment')
	.option('-n, --new', 'Create a new sketch', false)
	.option('-t, --template', 'Specify template to create the file from', '2d')
	.option('--typescript', 'Specify TypeScript support')
	.option('-b, --build', 'Build sketch for production', false)
	.option('--base', 'Base public path when served in production')
	.option('--outDir', 'Build output directory')
	.option('--emptyOutDir', 'Empty outDir before static build')
	.option('--exportDir', 'Directory used for exports')
	.option('-dev, --development', 'Enable development mode', false)
	.option('-p, --port', 'Port to bind')
	.option('-o, --open', 'Open in browser')
	.option('--prompts', 'Enable interactive prompts')
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
				base: options.base,
				outDir: options.outDir,
				emptyOutDir: options.emptyOutDir,
				development: options.development,
				prompts: options.prompts,
				configFilepath: options.config,
			});
		}

		run(entry, {
			exportDir: options.exportDir,
			development: options.development,
			port: options.port,
			open: options.open,
			configFilepath: options.config,
		});
	});

prog.command('create [entry]')
	.describe('Create a new sketch')
	.option('-t, --template', 'Specify template to create the file from', '2d')
	.option('--typescript', 'Specify TypeScript support')
	.option('--config', 'Path to Fragment config file')
	.action((entry = '', options) => {
		create(entry, {
			templateName: options.template,
			typescript: options.typescript,
			configFilepath: options.config,
		});
	});

prog.command('build [entry]')
	.describe('Build a sketch')
	.option('--base', 'Base public path')
	.option('--outDir', 'Output folder')
	.option('--emptyOutDir', 'Empty outDir before building for production')
	.option('-dev, --development', 'Enable development mode', false)
	.option('--prompts', 'Enable interactive prompts')
	.option('--config', 'Path to Fragment config file')
	.action((entry, options) => {
		build(entry, {
			base: options.base,
			outDir: options.outDir,
			emptyOutDir: options.emptyOutDir,
			development: options.development,
			prompts: options.prompts,
			configFilepath: options.config,
		});
	});

prog.command('preview [directory]')
	.describe('Preview a sketch')
	.option('-p, --port', 'Port to bind')
	.option('-o, --open', 'Open in browser')
	.option('--config', 'Path to Fragment config file')
	.action((dir, options) => {
		preview(dir, {
			port: options.port,
			open: options.open,
			configFilepath: options.config,
		});
	});

prog.parse(process.argv);
