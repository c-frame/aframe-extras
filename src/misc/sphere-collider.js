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
module.exports = AFRAME.registerComponent('sphere-collider', {
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
    this.handleHitEnd = this.handleHitEnd.bind(this);
  },

  remove: function () {
    this.pause();
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
        distanceMap = new Map();
    return function () {
      const el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh'),
          collisions = [];
      let colliderRadius;

      if (!mesh) { return; }

      distanceMap.clear();
      position.copy(el.object3D.getWorldPosition());
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // Update collision list.
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions
        .sort((a, b) => distanceMap.get(a) > distanceMap.get(b) ? 1 : -1)
        .forEach(this.handleHit);

      // Remove collision state from current element.
      if (collisions.length === 0) { el.emit('hit', {el: null}); }

      // Remove collision state from other elements.
      this.collisions
        .filter((el) => !distanceMap.has(el))
        .forEach(this.handleHitEnd);

      // Store new collisions
      this.collisions = collisions;

      // Bounding sphere collision detection
      function intersect (el) {
        let radius, mesh, distance, box, extent, size;

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
  },
  handleHitEnd: function (targetEl) {
    targetEl.emit('hitend');
    targetEl.removeState(this.data.state);
    this.el.emit('hitend', {el: targetEl});
  }
});
