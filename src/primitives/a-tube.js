/**
 * Tube following a custom path.
 *
 * Usage:
 *
 * ```html
 * <a-tube path="5 0 5, 5 0 -5, -5 0 -5" radius="0.5"></a-tube>
 * ```
 */
var Primitive = module.exports.Primitive = {
  defaultComponents: {
    tube:           {},
  },
  mappings: {
    path:           'tube.path',
    segments:       'tube.segments',
    radius:         'tube.radius',
    radialSegments: 'tube.radialSegments',
    closed:         'tube.closed'
  }
};

var Component = module.exports.Component = {
  schema: {
    path:           {default: []},
    segments:       {default: 64},
    radius:         {default: 1},
    radialSegments: {default: 8},
    closed:         {default: false}
  },

  init: function () {
    var el = this.el,
        data = this.data,
        material = el.components.material;

    if (!data.path.length) {
      console.error('[a-tube] `path` property expected but not found.');
      return;
    }

    var curve = new THREE.CatmullRomCurve3(data.path.map(function (point) {
      point = point.split(' ');
      return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
    }));
    var geometry = new THREE.TubeGeometry(
      curve, data.segments, data.radius, data.radialSegments, data.closed
    );

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial();
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    this.el.setObject3D('mesh', this.mesh);
  },

  remove: function () {
    if (this.mesh) this.el.removeObject3D('mesh');
  }
};

module.exports.registerAll = (function () {
  var registered = false;
  return function (AFRAME) {
    if (registered) return;
    AFRAME = AFRAME || window.AFRAME;
    AFRAME.registerComponent('tube', Component);
    AFRAME.registerPrimitive('a-tube', Primitive);
    registered = true;
  };
}());
