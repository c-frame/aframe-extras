#!/usr/bin/env node

const chalk = require('chalk'),
    fs = require('fs-extra'),
    zlib = require('zlib'),
    path = require('path'),
    browserify = require('browserify'),
    uglifyJS = require('uglify-js'),
    Readable = require('stream').Readable;

const EXAMPLES_DIR = 'examples',
    BUILD_DIR = 'build',
    DIST_DIR = 'dist';

console.log(chalk.green('Build...'));

fs.emptydirSync(BUILD_DIR);
fs.copySync(EXAMPLES_DIR, BUILD_DIR);

// Build.
const fileName = 'aframe-extras.raw.js';
const writeStream = fs.createWriteStream(path.join(BUILD_DIR, fileName));
const readStream = new Readable();
readStream.push([
  'window.AFRAME = require("aframe");',
  'window.AFRAME.extras = require("./").registerAll();'
].join('\n'));
readStream.push(null);
browserify()
  .add(readStream)
  .bundle()
  .pipe(writeStream);

// Minify.
writeStream.on('close', () => {
  fs.createWriteStream(path.join(BUILD_DIR, fileName.replace('.raw.js', '.js')))
    .end(uglifyJS.minify([path.join(BUILD_DIR, fileName)]).code);

  console.log(chalk.yellow('  ⇢  %s/%s'), BUILD_DIR, fileName.replace('.raw.js', '.js'));
});

process.on('exit', () => console.log(chalk.yellow('  ⇢  Done. 🍻   ')));
