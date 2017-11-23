#!/usr/bin/env node

const chalk = require('chalk'),
    fs = require('fs-extra'),
    zlib = require('zlib'),
    path = require('path'),
    browserify = require('browserify'),
    UglifyJS = require('uglify-es'),
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
  'require("./");'
].join('\n'));
readStream.push(null);
browserify()
  .add(readStream)
  .bundle()
  .pipe(writeStream);

// Minify.
writeStream.on('close', () => {
    const minJS = UglifyJS.minify(fs.readFileSync(path.join(BUILD_DIR, fileName), 'utf-8'));
    if (minJS.error) throw new Error(minJS.error);

  fs.createWriteStream(path.join(BUILD_DIR, fileName.replace('.raw.js', '.js')))
    .end(minJS.code);

  console.log(chalk.yellow('  ⇢  %s/%s'), BUILD_DIR, fileName.replace('.raw.js', '.js'));
});

process.on('exit', () => console.log(chalk.yellow('  ⇢  Done. 🍻   ')));
