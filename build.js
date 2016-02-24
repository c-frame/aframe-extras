#!/usr/bin/env node

var chalk = require('chalk'),
    path = require('path'),
    fs = require('fs-extra'),
    zlib = require('zlib'),
    browserify = require('browserify');

var EXAMPLES_DIR = 'examples',
    BUILD_DIR = 'build';

var gzip = zlib.createGzip();

console.log(chalk.green('Bundling examples...'));

fs.emptydirSync(BUILD_DIR);
fs.copySync(EXAMPLES_DIR, BUILD_DIR);
fs.readdirSync(BUILD_DIR)
  .map((dir) => path.join(BUILD_DIR, dir, 'index.js'))
  .filter((path) => {
    try { return fs.statSync(path).isFile(); } 
    catch (err) { return false; }
  })
  .map((file) => {
    var dir = path.dirname(file);
    
    console.log(chalk.yellow('  ⇢  %s/bundle.js'), dir);
    
    var bundle = browserify()
      .add(file)
      .bundle();
    bundle
      .pipe(fs.createWriteStream(path.join(dir, 'bundle.js')));
    bundle
      .pipe(gzip)
      .pipe(fs.createWriteStream(path.join(dir, 'bundle.js.gz')));
  });

process.on('exit', () => console.log(chalk.black.bgGreen('  Success! 🍻   ')));
