var Body = require('./body');

/**
 * Static body.
 *
 * Solid body with a fixed position. Unaffected by gravity and collisions, but
 * other objects may collide with it.
 */
module.exports = AFRAME.utils.extend({}, Body, {
  step: function () {
    this.syncToPhysics();
  }
});
