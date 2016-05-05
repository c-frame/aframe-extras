var Body = require('./body');

/**
 * Static body.
 *
 * Solid body with a fixed position. Unaffected by gravity and collisions, but
 * other objects may collide with it.
 */
module.exports = AFRAME.utils.extend({}, Body, {
  schema: {
    shape: {default: 'auto', oneOf: ['auto', 'box']}
  },
  step: function () {
    if (!this.body) return;
    if (this.el.components.velocity) this.body.velocity.copy(this.el.getAttribute('velocity'));
    if (this.el.components.position) this.body.position.copy(this.el.getAttribute('position'));
    if (this.wireframe) this.syncWireframe();
  }
});
