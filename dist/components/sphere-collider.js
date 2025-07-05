(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*************************************!*\
  !*** ./src/misc/sphere-collider.js ***!
  \*************************************/
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
AFRAME.registerComponent('sphere-collider', {
  schema: {
    enabled: {default: true},
    interval: {default: 80},
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
    this.prevCheckTime = undefined;

    this.eventDetail = {};
    this.handleHit = this.handleHit.bind(this);
    this.handleHitEnd = this.handleHitEnd.bind(this);
  },

  play: function () {
    const sceneEl = this.el.sceneEl;

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
    const data = this.data;
    let objectEls;

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
    const position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3(),
        colliderScale = new THREE.Vector3(),
        size = new THREE.Vector3(),
        box = new THREE.Box3(),
        collisions = [],
        distanceMap = new Map();
    return function (time) {
      if (!this.data.enabled) { return; }

      // Only check for intersection if interval time has passed.
      const prevCheckTime = this.prevCheckTime;
      if (prevCheckTime && (time - prevCheckTime < this.data.interval)) { return; }
      // Update check time.
      this.prevCheckTime = time;

      const el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh');
      let colliderRadius;

      if (!mesh) { return; }

      collisions.length = 0;
      distanceMap.clear();
      el.object3D.getWorldPosition(position);
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // Update collision list.
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions
        .sort((a, b) => distanceMap.get(a) > distanceMap.get(b) ? 1 : -1)
        .forEach(this.handleHit);

      // Remove collision state from other elements.
      this.collisions
        .filter((el) => !distanceMap.has(el))
        .forEach(this.handleHitEnd);

      // Store new collisions
      copyArray(this.collisions, collisions);

      // Bounding sphere collision detection
      function intersect (el) {
        let radius, mesh, distance, extent;

        if (!el.isEntity) { return; }

        mesh = el.getObject3D('mesh');

        if (!mesh) { return; }

        box.setFromObject(mesh).getSize(size);
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
        return Math.max(scaleVec.x, scaleVec.y, scaleVec.z);
      }
    };
  })(),

  handleHit: function (targetEl) {
    targetEl.emit('hit');
    targetEl.addState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hit', this.eventDetail);
  },
  handleHitEnd: function (targetEl) {
    targetEl.emit('hitend');
    targetEl.removeState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hitend', this.eventDetail);
  }
});

function copyArray (dest, source) {
  dest.length = 0;
  for (let i = 0; i < source.length; i++) { dest[i] = source[i]; }
}

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=sphere-collider.js.map