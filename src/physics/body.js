var CANNON = require('cannon'),
    mesh2shape = require('three-to-cannon');

require('../../lib/CANNON-shape2mesh');

module.exports = {
  schema: {
    shape: {default: 'auto', oneOf: ['auto', 'box', 'cylinder', 'sphere', 'hull']},
    cylinderAxis: {default: 'y', oneOf: ['x', 'y', 'z']},
    sphereRadius: {default: NaN},
    fixedRotation: {default: false}
  },

  /**
   * Initializes a body component, assigning it to the physics system and binding listeners for
   * parsing the elements geometry.
   */
  init: function () {
    this.system = this.el.sceneEl.systems.physics;

    if (this.el.sceneEl.hasLoaded) {
      this.initBody();
    } else {
      this.el.sceneEl.addEventListener('loaded', this.initBody.bind(this));
    }
  },

  /**
   * Parses an element's geometry and component metadata to create a CANNON.Body instance for the
   * component.
   */
  initBody: function () {
    var shape,
        el = this.el,
        data = this.data,
        pos = el.getComputedAttribute('position'),
        options = data.shape === 'auto' ? undefined : AFRAME.utils.extend({}, this.data, {
          type: mesh2shape.Type[data.shape.toUpperCase()]
        });

    // Matrix World must be updated at root level, if scale is to be applied – updateMatrixWorld()
    // only checks an object's parent, not the rest of the ancestors. Hence, a wrapping entity with
    // scale="0.5 0.5 0.5" will be ignored.
    // Reference: https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js#L511-L541
    // Potential fix: https://github.com/mrdoob/three.js/pull/7019
    this.el.object3D.updateMatrixWorld(true);
    shape = mesh2shape(this.el.object3D, options);

    if (!shape) {
      this.el.addEventListener('model-loaded', this.initBody.bind(this));
      return;
    }

    this.body = new CANNON.Body({
      mass: data.mass || 0,
      material: this.system.material,
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      linearDamping: data.linearDamping,
      angularDamping: data.angularDamping,
      fixedRotation: data.fixedRotation
    });
    this.body.addShape(shape, shape.offset, shape.orientation);

    // Apply rotation
    var rot = el.getComputedAttribute('rotation');
    this.body.quaternion.setFromEuler(
      THREE.Math.degToRad(rot.x),
      THREE.Math.degToRad(rot.y),
      THREE.Math.degToRad(rot.z),
      'XYZ'
    ).normalize();

    // Show wireframe
    if (this.system.debug) {
      this.createWireframe(this.body, shape);
    }

    this.el.body = this.body;
    this.body.el = this.el;
    this.isLoaded = true;

    // If component wasn't initialized when play() was called, finish up.
    if (this.isPlaying) {
      this._play();
    }

    this.el.emit('body-loaded', {body: this.el.body});
  },

  /**
   * Registers the component with the physics system, if ready.
   */
  play: function () {
    if (this.isLoaded) this._play();
  },

  /**
   * Internal helper to register component with physics system.
   */
  _play: function () {
    this.system.addBehavior(this, this.system.Phase.SIMULATE);
    this.system.addBody(this.body);
    if (this.wireframe) this.el.sceneEl.object3D.add(this.wireframe);

    this.syncToPhysics();
  },

  /**
   * Unregisters the component with the physics system.
   */
  pause: function () {
    if (!this.isLoaded) return;

    this.system.removeBehavior(this, this.system.Phase.SIMULATE);
    this.system.removeBody(this.body);
    if (this.wireframe) this.el.sceneEl.object3D.remove(this.wireframe);
  },

  /**
   * Removes the component and all physics and scene side effects.
   */
  remove: function () {
    this.pause();
    delete this.body.el;
    delete this.body;
    delete this.el.body;
    delete this.wireframe;
  },

  /**
   * Creates a wireframe for the body, for debugging.
   * TODO(donmccurdy) – Refactor this into a standalone utility or component.
   * @param  {CANNON.Body} body
   * @param  {CANNON.Shape} shape
   */
  createWireframe: function (body, shape) {
    var offset = shape.offset,
        orientation = shape.orientation,
        mesh = CANNON.shape2mesh(body).children[0];
    this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);

    if (offset) {
      this.wireframe.offset = offset.clone();
    }

    if (orientation) {
      orientation.inverse(orientation);
      this.wireframe.orientation = new THREE.Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w
      );
    }

    this.syncWireframe();
  },

  /**
   * Updates the debugging wireframe's position and rotation.
   */
  syncWireframe: function () {
    var offset,
        wireframe = this.wireframe;

    if (!this.wireframe) return;

    // Apply rotation. If the shape required custom orientation, also apply
    // that on the wireframe.
    wireframe.quaternion.copy(this.body.quaternion);
    if (wireframe.orientation) {
      wireframe.quaternion.multiply(wireframe.orientation);
    }

    // Apply position. If the shape required custom offset, also apply that on
    // the wireframe.
    wireframe.position.copy(this.body.position);
    if (wireframe.offset) {
      offset = wireframe.offset.clone().applyQuaternion(wireframe.quaternion);
      wireframe.position.add(offset);
    }

    wireframe.updateMatrix();
  },

  /**
   * Updates the CANNON.Body instance's position, velocity, and rotation, based on the scene.
   */
  syncToPhysics: (function () {
    var q =  new THREE.Quaternion(),
        v = new THREE.Vector3();
    return function () {
      var el = this.el,
          parentEl = el.parentEl,
          body = this.body;

      if (!body) return;

      if (el.components.velocity) body.velocity.copy(el.getComputedAttribute('velocity'));

      if (parentEl.isScene) {
        body.quaternion.copy(el.object3D.quaternion);
        body.position.copy(el.object3D.position);
      } else {
        el.object3D.getWorldQuaternion(q);
        body.quaternion.copy(q);
        el.object3D.getWorldPosition(v);
        body.position.copy(v);
      }

      if (this.wireframe) this.syncWireframe();
    };
  }()),

  /**
   * Updates the scene object's position and rotation, based on the physics simulation.
   */
  syncFromPhysics: (function () {
    var v = new THREE.Vector3(),
        q1 = new THREE.Quaternion(),
        q2 = new THREE.Quaternion();
    return function () {
      var el = this.el,
          parentEl = el.parentEl,
          body = this.body;

      if (!body) return;

      if (parentEl.isScene) {
        el.setAttribute('quaternion', body.quaternion);
        el.setAttribute('position', body.position);
      } else {
        // TODO - Nested rotation doesn't seem to be working as expected.
        q1.copy(body.quaternion);
        parentEl.object3D.getWorldQuaternion(q2);
        q1.multiply(q2.inverse());
        el.setAttribute('quaternion', {x: q1.x, y: q1.y, z: q1.z, w: q1.w});

        v.copy(body.position);
        parentEl.object3D.worldToLocal(v);
        el.setAttribute('position', {x: v.x, y: v.y, z: v.z});
      }

      if (this.wireframe) this.syncWireframe();
    };
  }())
};
