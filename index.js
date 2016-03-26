module.exports = {
  controls: require('./src/controls'),
  math:     require('./src/math'),
  misc:     require('./src/misc'),
  physics:  require('./src/physics'),
  shadows:  require('./src/shadows'),
  registerAll: function () {
    this.controls.registerAll();
    this.math.registerAll();
    this.misc.registerAll();
    this.physics.registerAll();
    this.shadows.registerAll();
  }
};
