/**
 * Rigid body.
 *
 * Solid body without deformation, but which is subject to collisions and gravity.
 */

var CANNON = require('cannon'),
    AFRAME = window.AFRAME;

module.exports = {
  schema: {
    width: { default: 1 },
    height: { default: 1 },
    depth: { default: 1 },

    mass: { default: 5 },
    linearDamping: {default: 0.01},
    angularDamping: {default: 0.01}
  },
  init: function () {},
  remove: function () {},

  update: function () {},
  tick: function () {}
};
