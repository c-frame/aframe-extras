/**
 * Velocity, in m/s.
 */
module.exports = {
  schema: {
    x: { default: 0.0 },
    y: { default: 0.0 },
    z: { default: 0.0 }
  },
  init: function () {},
  remove: function () {},
  update: (function () {
    var tPrev = Date.now();
    return function () {
      var t = Date.now();
      this.tick(t, t - tPrev);
      tPrev = t;
    };
  }()),
  tick: function (t, dt) {
    var position = this.el.getAttribute('position');
    this.el.setAttribute('position', {
      x: position.x + this.data.x * dt / 1000,
      y: position.y + this.data.y * dt / 1000,
      z: position.z + this.data.z * dt / 1000
    });
  },
};
