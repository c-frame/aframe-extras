/**
 * Flat grid.
 *
 * Defaults to 75x75.
 */
var Primitive = module.exports = {
  defaultComponents: {
    geometry: {
      primitive: 'plane',
      width: 75,
      height: 75
    },
    rotation: {x: -90, y: 0, z: 0},
    material: {
      src: 'url(https://cdn.rawgit.com/donmccurdy/aframe-extras/v1.16.3/assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'geometry.width',
    height: 'geometry.height',
    src: 'material.src'
  }
};

module.exports.registerAll = (function () {
  var registered = false;
  return function (AFRAME) {
    if (registered) return;
    AFRAME = AFRAME || window.AFRAME;
    AFRAME.registerPrimitive('a-grid', Primitive);
    registered = true;
  };
}());
