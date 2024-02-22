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
	.option('-p, --port', 'Port to bind', 3000)
	.option('-dev, --development', 'Enable development mode', false)
	.option('-b, --build', 'Build sketch for production', false)
	.option('--exportDir', 'Directory used for exports')
	.option('--outDir', 'Build output directory')
	.option('--emptyOutDir', 'Empty outDir before static build')
	.option('--base', 'Base public path when served in production', undefined)
	.action((entry, options) => {
		if (options.new) {
			return create({
				entry,
				templateName: options.template,
			});
		}

		if (options.build) {
			return build(entry, {
				development: options.development,
				outDir: options.outDir,
				emptyOutDir: options.emptyOutDir,
				base: options.base,
			});
		}

		run(entry, {
			development: options.development,
			exportDir: options.exportDir,
			port: options.port,
		});
	});

prog.command('create [entry]')
	.describe('Create a new sketch')
	.option('-t, --template', 'Specify template to create the file from', '2d')
	.action((entry = '', options) => {
		create(entry, {
			templateName: options.template,
		});
	});

prog.command('build [entry]')
	.describe('Build a sketch')
	.option('--outDir', 'Output folder', null)
	.option('--emptyOutDir', 'Empty outDir before building for production')
	.option('--base', 'Base public path', undefined)
	.option('-dev, --development', 'Enable development mode', false)
	.action((entry, options) => {
		build(entry, options);
	});

prog.command('preview [directory]')
	.describe('Preview a sketch')
	.option('-o, --open', 'Open in browser', false)
	.action((dir, options) => {
		preview(dir, options);
	});

prog.parse(process.argv);
