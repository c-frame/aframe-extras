(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./src/primitives');

},{"./src/primitives":5}],2:[function(require,module,exports){
'use strict';

/**
 * Flat grid.
 *
 * Defaults to 75x75.
 */

module.exports = AFRAME.registerPrimitive('a-grid', {
  defaultComponents: {
    geometry: {
      primitive: 'plane',
      width: 75,
      height: 75
    },
    rotation: { x: -90, y: 0, z: 0 },
    material: {
      src: 'url(https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v1.16.3/assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'geometry.width',
    height: 'geometry.height',
    src: 'material.src'
  }
});

},{}],3:[function(require,module,exports){
'use strict';

/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */

module.exports.Primitive = AFRAME.registerPrimitive('a-ocean', {
  defaultComponents: {
    ocean: {},
    rotation: { x: -90, y: 0, z: 0 }
  },
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    amplitude: 'ocean.amplitude',
    amplitudeVariance: 'ocean.amplitudeVariance',
    speed: 'ocean.speed',
    speedVariance: 'ocean.speedVariance',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});

module.exports.Component = AFRAME.registerComponent('ocean', {
  schema: {
    // Dimensions of the ocean area.
    width: { default: 10, min: 0 },
    depth: { default: 10, min: 0 },

    // Density of waves.
    density: { default: 10 },

    // Wave amplitude and variance.
    amplitude: { default: 0.1 },
    amplitudeVariance: { default: 0.3 },

    // Wave speed and variance.
    speed: { default: 1 },
    speedVariance: { default: 2 },

    // Material.
    color: { default: '#7AD2F7', type: 'color' },
    opacity: { default: 0.8 }
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function play() {
    var el = this.el;
    var data = this.data;
    var material = el.components.material;

    var geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    this.waves = [];
    var posAttribute = geometry.getAttribute('position');
    for (var i = 0; i < posAttribute.count; i++) {
      this.waves.push({
        z: posAttribute.getZ(i),
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        flatShading: true
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function remove() {
    this.el.removeObject3D('mesh');
  },

  tick: function tick(t, dt) {
    if (!dt) return;

    var posAttribute = this.mesh.geometry.getAttribute('position');
    for (var i = 0; i < posAttribute.count; i++) {
      var vprops = this.waves[i];
      var value = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      posAttribute.setZ(i, value);
      vprops.ang += vprops.speed * dt;
    }
    posAttribute.needsUpdate = true;
  }
});

},{}],4:[function(require,module,exports){
'use strict';

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
    tube: {}
  },
  mappings: {
    path: 'tube.path',
    segments: 'tube.segments',
    radius: 'tube.radius',
    'radial-segments': 'tube.radialSegments',
    closed: 'tube.closed'
  }
});

module.exports.Component = AFRAME.registerComponent('tube', {
  schema: {
    path: { default: [] },
    segments: { default: 64 },
    radius: { default: 1 },
    radialSegments: { default: 8 },
    closed: { default: false }
  },

  init: function init() {
    var el = this.el,
        data = this.data;
    var material = el.components.material;

    if (!data.path.length) {
      console.error('[a-tube] `path` property expected but not found.');
      return;
    }

    var curve = new THREE.CatmullRomCurve3(data.path.map(function (point) {
      point = point.split(' ');
      return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
    }));
    var geometry = new THREE.TubeGeometry(curve, data.segments, data.radius, data.radialSegments, data.closed);

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial();
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    this.el.setObject3D('mesh', this.mesh);
  },

  update: function update(prevData) {
    if (!Object.keys(prevData).length) return;

    this.remove();
    this.init();
  },

  remove: function remove() {
    if (this.mesh) this.el.removeObject3D('mesh');
  }
});

},{}],5:[function(require,module,exports){
'use strict';

require('./a-grid');
require('./a-ocean');
require('./a-tube');

},{"./a-grid":2,"./a-ocean":3,"./a-tube":4}]},{},[1]);
