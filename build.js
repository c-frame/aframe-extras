#!/usr/bin/env node

var chalk = require('chalk'),
    path = require('path'),
    fs = require('fs-extra'),
    browserify = require('browserify');

var EXAMPLES_DIR = 'examples',
    BUILD_DIR = 'build';

console.log(chalk.green('Bundling examples...'));

fs.emptydirSync(BUILD_DIR);
fs.copySync(EXAMPLES_DIR, BUILD_DIR);
browserify()
  .add('./browser.js')
  .bundle()
  .pipe(fs.createWriteStream(path.join(BUILD_DIR, 'aframe-extras.js')));

console.log(chalk.yellow('  ⇢  %s/aframe-extras.js'), BUILD_DIR);

process.on('exit', () => console.log(chalk.black.bgGreen('  Success! 🍻   ')));
