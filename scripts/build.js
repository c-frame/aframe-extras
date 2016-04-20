#!/usr/bin/env node

var chalk = require('chalk'),
    fs = require('fs-extra');

var EXAMPLES_DIR = 'examples',
    BUILD_DIR = 'build';

console.log(chalk.green('Build...'));

fs.emptydirSync(BUILD_DIR);
fs.copySync(EXAMPLES_DIR, BUILD_DIR);

process.on('exit', () => console.log(chalk.yellow('  ⇢  Done. 🍻   ')));
