/**
 * Velocity, in m/s.
 */

var AFRAME = window.AFRAME;

module.exports = AFRAME.aframeCore.utils.extend({
  schema: {
    // TODO - type: vec3
    x: { default: 0 },
    y: { default: 0 },
    z: { default: 0 }
  },
  init: function () {
    this.tPrev = Date.now();

    if (this.el.sceneEl.addBehavior) this.el.sceneEl.addBehavior(this);
  },
  remove: function () {},
  update: function (previousData) {
    if (previousData) return;
    var t = Date.now();
    this.tick(t, t - this.tPrev);
    this.tPrev = t;
  },
  tick: function (t, dt) {
    var physics = this.el.sceneEl.components.physics || {data:{maxInterval: 1 / 60}},
        velocity = this.el.getAttribute('velocity'), // TODO - why not this.el.data?
        position = this.el.getAttribute('position');

    dt = Math.min(dt, physics.data.maxInterval * 1000);

    this.el.setAttribute('position', {
      x: position.x + velocity.x * dt / 1000,
      y: position.y + velocity.y * dt / 1000,
      z: position.z + velocity.z * dt / 1000
    });
  },
}, AFRAME.aframeCore.utils.coordinates.componentMixin);
