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
    this.el.addEventListener('model-loaded', this.update.bind(this, {}, 'foobar'));
  },

  tick: function () {},

  update: function (previousData) {
    // TODO: This check won't be necessary after v0.2.0.
    if (previousData) {
      var data = this.data;

      // Applied recursively to support imported models.
      this.el.object3D.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
          node.castShadow = data.cast;
          node.receiveShadow = data.receive;
        }
      });
    }
  },

  remove: function () {}
};
