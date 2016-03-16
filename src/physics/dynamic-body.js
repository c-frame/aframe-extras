/**
 * Dynamic body.
 *
 * Moves according to physics simulation, and may collide with other objects.
 */
var CANNON = require('cannon');

module.exports = {
  schema: {
    width:          { default: 1 },
    height:         { default: 1 },
    depth:          { default: 1 },

    mass:           { default: 5 },
    linearDamping:  { default: 0.01 },
    angularDamping: { default: 0.01 }
  },
  init: function () {
    var physics = this.el.sceneEl.components.physics;
    if (!physics) {
      this.el.sceneEl.addEventListener('physics-loaded', this.init.bind(this));
      return;
    }

    // TODO

    // Show wireframe
    if (physics.data.debug) {
      var mesh = CANNON.shape2mesh(this.body).children[0];
      this.el.object3D.add(new THREE.EdgesHelper(mesh, 0xff0000));
    }

    physics.registerBody(this.body);
    if (this.el.sceneEl.addBehavior) this.el.sceneEl.addBehavior(this);
    console.info('[dynamic-body] loaded');
  },
  remove: function () {},
  update: function () {},
  tick: function () {}
};
