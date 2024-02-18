#!/usr/bin/env node

import sade from 'sade';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { bold, cyan, green, grey, red, white, yellow } from 'kleur/colors';
import * as p from '@clack/prompts';
import { run } from '../src/cli/index.js';
import { create } from '../src/cli/create.js';
import { file, packageManager } from '../src/cli/utils.js';
import log from '../src/cli/log.js';

const { version } = JSON.parse(
	fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
);

console.log(grey(`[fragment] v${version}\n`));

const prog = sade('fragment');
prog.version(`${version}`);

prog.command('run [entry]', '', { default: true })
	.describe('Run a dev environment for fragment')
	.option('-n, --new', 'Create file if it does not exist', false)
	.option('-t, --template', 'Specify template to create the file from', '2d')
	.option('-p, --port', 'Port to bind', 3000)
	.option('-dev, --development', 'Enable development mode', false)
	.option('-b, --build', 'Build sketch for production', false)
	.option('--exportDir', 'Directory used for exports')
	.option('--outDir', 'Directory used for static build', null)
	.option('--emptyOutDir', 'Empty outDir before static build', false)
	.option('--base', 'Base public path when served in production', undefined)
	.action((entry, options) => {
		if (options.new) {
			create({
				entry,
				templateName: options.template,
			});
			return;
		}

		run(entry, options);
	});

prog.command('create [entry]')
	.describe('Create a new sketch')
	.action((entry = '', options) => {
		create({
			entry,
		});
	});

prog.command('build [entry]')
	.describe('Build a sketch')
	.option('--outDir', 'Directory used for static build', null)
	.option('--emptyOutDir', 'Empty outDir before static build', false)
	.option('--base', 'Base public path when served in production', undefined)
	.action((entry, options) => {
		console.log('build fragment', entry);
	});

prog.parse(process.argv);
