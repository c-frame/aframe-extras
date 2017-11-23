module.exports = {
  controls:    require('./src/controls'),
  loaders:     require('./src/loaders'),
  misc:        require('./src/misc'),
  pathfinding: require('./src/pathfinding'),
  primitives:  require('./src/primitives'),

  registerAll: function () {
    this.controls.registerAll();
    this.loaders.registerAll();
    this.misc.registerAll();
    this.pathfinding.registerAll();
    this.primitives.registerAll();
  }
};
