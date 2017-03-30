#!/usr/bin/env node

const chalk = require('chalk'),
    fs = require('fs-extra'),
    browserify = require('browserify'),
    uglifyJS = require('uglify-js'),
    Readable = require('stream').Readable,
    execSync = require('child_process').execSync;

const REGISTRY = require('../registry.json'),
      PACKAGE = require('../package.json');

const PUBLISH_DIR = './tmp';

fs.emptydirSync(PUBLISH_DIR);

REGISTRY.forEach((mod) => {
  const package = Object.assign({}, PACKAGE, mod),
        dir = `${PUBLISH_DIR}/${package.name}`;

  fs.mkdirSync(dir);
  fs.mkdirSync(dir + '/dist');
  fs.copySync(`./${package.main}.js`, `./${dir}/index.js`);

  Promise.all([
    createPackage(package, dir),
    createReadme(package, dir),
    createDist(package, dir)
  ]).then(() => {
    execSync(`cd ${dir} && npm publish;`, {stdio:[0,1,2]});
    console.log(chalk.green('  ⇢  📦  Published "%s" to NPM.'), package.name);
    console.log('');
  });
});

function createPackage (package, dir) {
  fs.outputJsonSync(`${dir}/package.json`, {
    name:             package.name,
    version:          package.version,
    description:      package.description,
    author:           package.author,
    license:          package.license,
    main:             'index.js',
    repository:       package.repository,
    peerDependencies: package.peerDependencies,
    keywords:         package.keywords,
  }, null, (e) => { throw e; });

  return Promise.resolve();
}

function createReadme (package, dir) {
  fs.outputFileSync(`${dir}/README.md`,`
# ${package.name}

${package.description}
  `);

  return Promise.resolve();
}

function createDist (package, dir) {
  const componentName = package.name.replace(/^[\w-]+\./, ''),
        deferred = Promise.defer(),
        inputStream = new Readable(),
        writeStream = fs.createWriteStream(`${dir}/dist/${package.name}.js`);

  if (package.bundle) {
    inputStream.push(`require('${dir}/index.js').registerAll();`);
  } else {
    inputStream.push(`
    AFRAME.registerComponent(
      '${componentName}',
      require('${dir}/index.js')
    );`);
  }
  inputStream.push(null);

  writeStream.on('close', () => {
    fs.outputFileSync(
      `${dir}/dist/${package.name}.min.js`,
      uglifyJS.minify([`${dir}/dist/${package.name}.js`]).code
    );
    console.log(chalk.yellow('  ⇢  Bundled "%s".'), package.name);
    deferred.resolve();
  });

  browserify()
    .add(inputStream)
    .bundle()
    .pipe(writeStream);

  return deferred.promise;
}

process.on('exit', (err) => {
  const n = REGISTRY.length;
  console.log('  ...');
  if (err) console.log(chalk.red('  ⇢  Failed to publish modules.'));
  else {
    console.log(chalk.green('  ⇢  🍻   %d/%d modules published.'), n, n);
    fs.emptydirSync(PUBLISH_DIR);
  }
});
