(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
AFRAME.registerComponent('sphere-collider', require('./src/misc/sphere-collider'));
},{"./src/misc/sphere-collider":2}],2:[function(require,module,exports){
/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Implement bounding sphere collision detection for entities with a mesh.
 * Sets the specified state on the intersected entities.
 *
 * @property {string} objects - Selector of the entities to test for collision.
 * @property {string} state - State to set on collided entities.
 *
 */
module.exports = {
  schema: {
    objects: {default: ''},
    state: {default: 'collided'},
    radius: {default: 0.05},
    watch: {default: true}
  },

  init: function () {
    /** @type {MutationObserver} */
    this.observer = null;
    /** @type {Array<Element>} Elements to watch for collisions. */
    this.els = [];
    /** @type {Array<Element>} Elements currently in collision state. */
    this.collisions = [];

    this.handleHit = this.handleHit.bind(this);
  },

  remove: function () {
    this.pause();
  },

  play: function () {
    var sceneEl = this.el.sceneEl;

    if (this.data.watch) {
      this.observer = new MutationObserver(this.update.bind(this, null));
      this.observer.observe(sceneEl, {childList: true, subtree: true});
    }
  },

  pause: function () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  /**
   * Update list of entities to test for collision.
   */
  update: function () {
    var data = this.data;
    var objectEls;

    // Push entities into list of els to intersect.
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
    } else {
      // If objects not defined, intersect with everything.
      objectEls = this.el.sceneEl.children;
    }
    // Convert from NodeList to Array
    this.els = Array.prototype.slice.call(objectEls);
  },

  tick: (function () {
    var position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3(),
        meshScale = new THREE.Vector3(),
        colliderScale = new THREE.Vector3(),
        distanceMap = new Map();
    return function () {
      var el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh'),
          colliderRadius,
          collisions = [];

      if (!mesh) { return; }

      distanceMap.clear();
      position.copy(el.object3D.getWorldPosition());
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // Update collision list.
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions
        .sort(function (a, b) {
          return distanceMap.get(a) > distanceMap.get(b) ? 1 : -1;
        })
        .forEach(this.handleHit);

      // Remove collision state from current element.
      if (collisions.length === 0) { el.emit('hit', {el: null}); }

      // Remove collision state from other elements.
      this.collisions.filter(function (el) {
        return !distanceMap.has(el);
      }).forEach(function removeState (el) {
        el.removeState(data.state);
      });

      // Store new collisions
      this.collisions = collisions;

      // Bounding sphere collision detection
      function intersect (el) {
        var radius, mesh, distance, box, extent, size;

        if (!el.isEntity) { return; }

        mesh = el.getObject3D('mesh');

        if (!mesh) { return; }

        box = new THREE.Box3().setFromObject(mesh);
        size = box.getSize();
        extent = Math.max(size.x, size.y, size.z) / 2;
        radius = Math.sqrt(2 * extent * extent);
        box.getCenter(meshPosition);

        if (!radius) { return; }

        distance = position.distanceTo(meshPosition);
        if (distance < radius + colliderRadius) {
          collisions.push(el);
          distanceMap.set(el, distance);
        }
      }
      // use max of scale factors to maintain bounding sphere collision
      function scaleFactor (scaleVec) {
        return Math.max.apply(null, scaleVec.toArray());
      }
    };
  })(),

  handleHit: function (targetEl) {
    targetEl.emit('hit');
    targetEl.addState(this.data.state);
    this.el.emit('hit', {el: targetEl});
  }
};

},{}]},{},[1]);
