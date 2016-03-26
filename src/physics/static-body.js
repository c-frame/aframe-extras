/**
 * Static body.
 *
 * Solid body with a fixed position. Unaffected by gravity and collisions, but
 * other objects may collide with it.
 */

var CANNON = require('cannon');
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
    var sceneEl = this.el.sceneEl,
        physics = sceneEl.components && sceneEl.components.physics;

    if (!physics) {
      sceneEl.addEventListener('physics-loaded', this.init.bind(this));
      return;
    }

    var el = this.el,
        data = this.data,
        pos = el.getAttribute('position');

    var halfExtents = new CANNON.Vec3(data.width / 2, data.height / 2, data.depth / 2);
    this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(halfExtents),
      material: physics.material,
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
    if (physics.data.debug) {
      var mesh = CANNON.shape2mesh(this.body).children[0];
      this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);
      this.syncWireframe();
      this.el.sceneEl.object3D.add(this.wireframe);
    }

    this.body.el = this.el;
    physics.addBody(this.body);
    console.info('[static-body] loaded');
  },

  remove: function () {
    var physics = this.el.sceneEl.components.physics;
    if (physics) physics.removeBody(this.body);
    if (this.wireframe) this.el.sceneEl.object3D.remove(this.wireframe);
  },

  /*******************************************************************
   * Tick
   */

  tick: function () {
    if (!this.body) return;

    var physics = this.el.sceneEl.components.physics;

    if (this.el.components.velocity) this.body.velocity.copy(this.el.getAttribute('velocity'));
    if (this.el.components.position) this.body.position.copy(this.el.getAttribute('position'));
    if (physics.data.debug) this.syncWireframe();
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
