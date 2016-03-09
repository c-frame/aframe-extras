module.exports = {
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
  tick: function (t, dt) {},

  // Rotation controls interface
  isRotationActive: function () { return false; },
  getRotation: function () {}
};
