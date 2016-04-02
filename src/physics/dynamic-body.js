var Body = require('./body');

/**
 * Dynamic body.
 *
 * Moves according to physics simulation, and may collide with other objects.
 */
module.exports = AFRAME.utils.extend({}, Body, {
  dependencies: ['position', 'quaternion', 'velocity'],

  schema: {
    mass:           { default: 5 },
    linearDamping:  { default: 0.01 },
    angularDamping: { default: 0.01 }
  },

  tick: function () {
    if (!this.body) return;
    this.el.setAttribute('quaternion', this.body.quaternion);
    this.el.setAttribute('position', this.body.position);
    if (this.wireframe) this.syncWireframe();
  }
});
