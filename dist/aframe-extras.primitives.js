(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/primitives').registerAll();
},{"./src/primitives":4}],2:[function(require,module,exports){
/**
 * Flat grid.
 *
 * Defaults to 75x75.
 */
module.exports = {
  defaultAttributes: {
    geometry: {
      primitive: 'plane',
      width: 75,
      height: 75
    },
    rotation: {x: -90, y: 0, z: 0},
    material: {
      src: 'url(../../assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'geometry.width',
    depth: 'geometry.depth',
    src: 'material.src'
  }
};

},{}],3:[function(require,module,exports){
/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */
module.exports.Primitive = {
  defaultAttributes: {
    ocean: {},
    rotation: {x: -90, y: 0, z: 0}
  },
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density'
  }
};

module.exports.Component = {
  schema: {
    // Dimensions of the ocean area.
    width: {default: 10, min: 0},
    depth: {default: 10, min: 0},

    // Density of waves.
    density: {default: 10},

    // Wave amplitude and variance.
    amplitude: {default: 0.1},
    amplitudeVariance: {default: 0.3},

    // Wave speed and variance.
    speed: {default: 1},
    speedVariance: {default: 2}
  },

  init: function () {
    var el = this.el,
        data = this.data,
        material = el.components.material;

    var geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    geometry.mergeVertices();
    this.waves = [];
    for (var v, i = 0, l = geometry.vertices.length; i < l; i++) {
      v = geometry.vertices[i];
      this.waves.push({
        z: v.z,
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: 0x7AD2F7,
        transparent:true,
        opacity: 0.8,
        shading: THREE.FlatShading,
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.object3D.add(this.mesh);
  },

  remove: function () {
    this.el.object3D.remove(this.mesh);
  },

  tick: function (t, dt) {
    if (isNaN(dt)) return;

    var verts = this.mesh.geometry.vertices;
    for (var v, vprops, i = 0; (v = verts[i]); i++){
      vprops = this.waves[i];
      v.z = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      vprops.ang += vprops.speed * dt;
    }
    this.mesh.geometry.verticesNeedUpdate = true;
  }
};

},{}],4:[function(require,module,exports){
module.exports = {
  'a-grid':        require('./a-grid'),
  'a-ocean':        require('./a-ocean'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;

    AFRAME.registerPrimitive('a-grid',  this['a-grid']);

    AFRAME.registerComponent('ocean', this['a-ocean'].Component);
    AFRAME.registerPrimitive('a-ocean', this['a-ocean'].Primitive);

    this._registered = true;
  }
};

},{"./a-grid":2,"./a-ocean":3}]},{},[1]);
