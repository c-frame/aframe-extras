/**
 * Shadow component.
 *
 * Source: https://github.com/aframevr/aframe-core/pull/348
 *
 * @namespace shadow
 * @param {bool} [cast=false] - whether object will cast shadows.
 * @param {bool} [receive=false] - whether object will receive shadows.
 */
module.exports = {
  schema: {
    cast:     { default: false },
    receive:  { default: false }
  },

  init: function () {
    this.update({});
  },

  tick: function () {},

  update: function (previousData) {
    // TODO: This check won't be necessary after v0.2.0.
    if (previousData) {
      var el = this.el;
      el.object3D.castShadow = this.data.cast;
      el.object3D.receiveShadow = this.data.receive;
    }
  },

  remove: function () {}
};
