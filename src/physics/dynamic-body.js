/**
 * Dynamic body.
 *
 * Moves according to physics simulation, and may collide with other objects.
 */
var CANNON = require('cannon');
require('../../lib/CANNON-shape2mesh');

module.exports = {

  /*******************************************************************
   * Schema
   */

  schema: {
    width:          { default: 1 },
    height:         { default: 1 },
    depth:          { default: 1 },

    mass:           { default: 5 },
    linearDamping:  { default: 0.01 },
    angularDamping: { default: 0.01 }
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

    this.euler = new THREE.Euler();

    var halfExtents = new CANNON.Vec3(data.width / 2, data.height / 2, data.depth / 2);
    this.body = new CANNON.Body({
      shape: new CANNON.Box(halfExtents),
      material: physics.material,
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      mass: data.mass,
      linearDamping: data.linearDamping,
      angularDamping: data.angularDamping
    });

    if (el.getAttribute('rotation')) {
      // Gimbal lock with Euler rotation is problematic.
      throw new Error('[dynamic-body] Preset rotation not yet supported.');
    }

    // Show wireframe
    if (physics.data.debug) {
      var mesh = CANNON.shape2mesh(this.body).children[0];
      this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);
      this.el.sceneEl.object3D.add(this.wireframe);
    }

    this.body.el = this.el;
    physics.addBody(this.body);
    console.info('[dynamic-body] loaded');
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

    this.el.setAttribute('quaternion', this.body.quaternion);
    this.el.setAttribute('position', this.body.position);

    // Update wireframe
    var physics = this.el.sceneEl.components.physics;
    if (physics.data.debug) {
      this.wireframe.quaternion.copy(this.body.quaternion);
      this.wireframe.position.copy(this.body.position);
      this.wireframe.updateMatrix();
    }
  }
};
