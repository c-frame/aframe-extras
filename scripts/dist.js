#!/usr/bin/env node

var chalk = require('chalk'),
    path = require('path'),
    fs = require('fs-extra'),
    browserify = require('browserify'),
    uglifyJS = require('uglify-js'),
    Readable = require('stream').Readable;

var DIST_DIR = 'dist',
    PACKAGES = ['controls', 'loaders', 'math', 'misc', 'physics', 'primitives', 'shadows'];

var streams = {};

// Full build.
var stream = new Readable();
stream.push(`require('./').registerAll();`);
stream.push(null);
streams['aframe-extras.js'] = stream;

// Individual packages.
PACKAGES.forEach((name) => {
  var stream = new Readable();
  stream.push(`require('./src/${name}').registerAll();`);
  stream.push(null);
  streams[`aframe-extras.${name}.js`] = stream;
});

// Browserify.
console.log(chalk.green('Dist...'));
fs.emptydirSync(DIST_DIR);
Object.keys(streams).forEach((fileName) => {
  var writeStream = fs.createWriteStream(path.join(DIST_DIR, fileName));
  browserify()
    .add(streams[fileName])
    .bundle()
    .pipe(writeStream);

  // Minify.
  writeStream.on('close', () => {
    fs.createWriteStream(path.join(DIST_DIR, fileName.replace('.js', '.min.js')))
      .end(uglifyJS.minify([path.join(DIST_DIR, fileName)]).code);

    console.log(chalk.yellow('  ⇢  %s/%s'), DIST_DIR, fileName);
  });
});

// Exit handler.
process.on('exit', (err) => {
  if (err) console.log(chalk.red('  ⇢  Failed.'));
  else console.log(chalk.yellow('  ⇢  Done. 🍻   '));
});

process.on('uncaughtException', (e) => {
  console.error(chalk.red('  ⇢  %s, %s:%d'), e.message, e.filename, e.line);
  process.exit(1);
});
