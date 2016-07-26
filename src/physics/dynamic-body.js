var Body = require('./body');

/**
 * Dynamic body.
 *
 * Moves according to physics simulation, and may collide with other objects.
 */
module.exports = AFRAME.utils.extend({}, Body, {
  dependencies: ['quaternion', 'velocity'],

  schema: AFRAME.utils.extend({}, Body.schema, {
    mass:           { default: 5 },
    linearDamping:  { default: 0.01 },
    angularDamping: { default: 0.01 }
  }),

  step: function () {
    this.syncFromPhysics();
  }
});
