var extras = {
  controls:   require('./src/controls'),
  loaders:    require('./src/loaders'),
  math:       require('./src/math'),
  misc:       require('./src/misc'),
  physics:    require('./src/physics'),
  primitives: require('./src/primitives'),
  shadows:    require('./src/shadows')
};

Object.keys(extras).forEach(function (name) {
  extras[name].extras = extras;
});

extras.registerAll = function () {
  this.controls.registerAll();
  this.loaders.registerAll();
  this.math.registerAll();
  this.misc.registerAll();
  this.physics.registerAll();
  this.primitives.registerAll();
  this.shadows.registerAll();
};

module.exports = extras;
