/**
 * Static body.
 *
 * Solid body with a fixed position. Unaffected by gravity and collisions, but
 * other objects may collide with it.
 */

var CANNON = require('cannon'),
    object2shape = require('../../lib/object2shape');

require('../../lib/CANNON-shape2mesh');

module.exports = {

  /*******************************************************************
   * Schema
   */

  schema: {
    width:  { default: 1 },
    height: { default: 1 },
    depth:  { default: 1 }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    this.system = this.el.sceneEl.systems.physics;

    var shape = object2shape(this.el.object3D);
    if (shape && this.el.sceneEl.hasLoaded) {
      this.initBody(shape);
    } else if (shape) {
      this.el.sceneEl.addEventListener('loaded', this.initBody.bind(this, shape));
    } else {
      this.el.addEventListener('model-loaded', function (e) {
        this.initBody(object2shape(e.detail.model));
      }.bind(this));
    }
  },

  initBody: function (shape) {
    var el = this.el,
        data = this.data,
        pos = el.getAttribute('position');

    if (!pos) {
      pos = {x: 0, y: 0, z: 0};
      el.setAttribute('position', pos);
    }

    // Apply scaling
    if (this.el.hasAttribute('scale')) {
      if (shape.setScale) {
        shape.setScale(this.el.getAttribute('scale'));
      } else {
        console.warn('Physics body scaling could not be applied.');
      }
    }

    this.body = new CANNON.Body({
      mass: 0,
      shape: shape,
      material: this.system.material,
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      linearDamping: data.linearDamping,
      angularDamping: data.angularDamping
    });

    // Apply rotation
    var rot = el.getAttribute('rotation') || {x: 0, y: 0, z: 0};
    this.body.quaternion.setFromEuler(
      THREE.Math.degToRad(rot.x),
      THREE.Math.degToRad(rot.y),
      THREE.Math.degToRad(rot.z),
      'XYZ'
    ).normalize();

    // Show wireframe
    if (this.system.options.debug) {
      var mesh = CANNON.shape2mesh(this.body).children[0];
      this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);
      this.syncWireframe();
      this.el.sceneEl.object3D.add(this.wireframe);
    }

    this.body.el = this.el;
    this.system.addBody(this.body);
    console.info('[static-body] loaded');
  },

  remove: function () {
    if (this.body) this.system.removeBody(this.body);
    if (this.wireframe) this.el.sceneEl.object3D.remove(this.wireframe);
  },

  /*******************************************************************
   * Tick
   */

  tick: function () {
    if (!this.body) return;
    if (this.el.components.velocity) this.body.velocity.copy(this.el.getAttribute('velocity'));
    if (this.el.components.position) this.body.position.copy(this.el.getAttribute('position'));
    if (this.wireframe) this.syncWireframe();
  },

  /*******************************************************************
   * Debugging
   */

  syncWireframe: function () {
    this.wireframe.quaternion.copy(this.body.quaternion);
    this.wireframe.position.copy(this.body.position);
    this.wireframe.updateMatrix();
  }
};
