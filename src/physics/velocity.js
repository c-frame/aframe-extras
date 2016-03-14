/**
 * Velocity, in m/s.
 */

var AFRAME = window.AFRAME;

module.exports = AFRAME.aframeCore.utils.extend({
  schema: {
    x: { default: 0 },
    y: { default: 0 },
    z: { default: 0 }
  },
  init: function () {
    if (this.el.sceneEl.addBehavior) {
      this.el.sceneEl.addBehavior(this);
    }
  },
  remove: function () {},
  update: (function () {
    var tPrev = Date.now();
    return function (previousData) {
      if (previousData) return;

      var t = Date.now();
      this.tick(t, t - tPrev);
      tPrev = t;
    };
  }()),
  tick: function (t, dt) {
    var data = this.data,
        position = this.el.getAttribute('position');

    this.el.setAttribute('position', {
      x: position.x + data.x * dt / 1000,
      y: position.y + data.y * dt / 1000,
      z: position.z + data.z * dt / 1000
    });
  },
}, AFRAME.aframeCore.utils.coordinates.componentMixin);
