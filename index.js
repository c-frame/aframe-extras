module.exports = {
  controls:    require('./src/controls'),
  loaders:     require('./src/loaders'),
  misc:        require('./src/misc'),
  pathfinding: require('./src/pathfinding'),
  physics:     require('aframe-physics-system'),
  primitives:  require('./src/primitives'),

  registerAll: function () {
    this.controls.registerAll();
    this.loaders.registerAll();
    this.misc.registerAll();
    this.pathfinding.registerAll();
    this.physics.registerAll();
    this.primitives.registerAll();
  }
};
