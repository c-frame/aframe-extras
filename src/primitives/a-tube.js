/**
 * Tube following a custom path.
 *
 * Usage:
 *
 * ```html
 * <a-tube path="5 0 5, 5 0 -5, -5 0 -5" radius="0.5"></a-tube>
 * ```
 */
module.exports.Primitive = AFRAME.registerPrimitive('a-tube', {
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
});

module.exports.Component = AFRAME.registerComponent('tube', {
  schema: {
    path:           {default: []},
    segments:       {default: 64},
    radius:         {default: 1},
    radialSegments: {default: 8},
    closed:         {default: false}
  },

  init: function () {
    const el = this.el,
        data = this.data;
    let material = el.components.material;

    if (!data.path.length) {
      console.error('[a-tube] `path` property expected but not found.');
      return;
    }

    const curve = new THREE.CatmullRomCurve3(data.path.map(function (point) {
      point = point.split(' ');
      return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
    }));
    const geometry = new THREE.TubeGeometry(
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
});
