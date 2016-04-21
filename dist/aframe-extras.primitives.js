(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/primitives').registerAll();
},{"./src/primitives":3}],2:[function(require,module,exports){
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
module.exports = {
  'a-grid':        require('./a-grid'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerPrimitive('a-grid', this['a-grid']);

    this._registered = true;
  }
};

},{"./a-grid":2}]},{},[1]);
