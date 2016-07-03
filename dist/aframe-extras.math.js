(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/math').registerAll();
},{"./src/math":2}],2:[function(require,module,exports){
module.exports = {
  'velocity':   require('./velocity'),
  'quaternion': require('./quaternion'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    if (!AFRAME.components['velocity'])    AFRAME.registerComponent('velocity',   this.velocity);
    if (!AFRAME.components['quaternion'])  AFRAME.registerComponent('quaternion', this.quaternion);

    this._registered = true;
  }
};

},{"./quaternion":3,"./velocity":4}],3:[function(require,module,exports){
/**
 * Quaternion.
 *
 * Represents orientation of object in three dimensions. Similar to `rotation`
 * component, but avoids problems of gimbal lock.
 *
 * See: https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation
 */
module.exports = {
  schema: {type: 'vec4'},
  update: function () {
    var data = this.data;
    this.el.object3D.quaternion.set(data.x, data.y, data.z, data.w);
  }
};

},{}],4:[function(require,module,exports){
/**
 * Velocity, in m/s.
 */
module.exports = {
  schema: {type: 'vec3'},

  init: function () {
    this.system = this.el.sceneEl.systems.physics;

    if (this.system) {
      this.system.addBehavior(this, this.system.Phase.RENDER);
    }
  },

  remove: function () {
    if (this.system) {
      this.system.removeBehavior(this, this.system.Phase.RENDER);
    }
  },

  tick: function (t, dt) {
    if (!dt) return;
    if (this.system) return;
    this.step(t, dt);
  },

  step: function (t, dt) {
    if (!dt) return;

    var physics = this.el.sceneEl.systems.physics || {maxInterval: 1 / 60},

        // TODO - There's definitely a bug with getComputedAttribute and el.data.
        velocity = this.el.getAttribute('velocity') || {x: 0, y: 0, z: 0},
        position = this.el.getAttribute('position') || {x: 0, y: 0, z: 0};

    dt = Math.min(dt, physics.maxInterval * 1000);

    this.el.setAttribute('position', {
      x: position.x + velocity.x * dt / 1000,
      y: position.y + velocity.y * dt / 1000,
      z: position.z + velocity.z * dt / 1000
    });
  }
};

},{}]},{},[1]);
