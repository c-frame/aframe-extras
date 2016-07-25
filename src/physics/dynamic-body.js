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
    angularDamping: { default: 0.01 },
    shape: {default: 'auto', oneOf: ['auto', 'box', 'sphere', 'hull']}
  },

  step: function () {
    this.syncFromPhysics();
  }
});
