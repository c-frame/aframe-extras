/**
 * Rigid body.
 *
 * Solid body without deformation, but which is subject to collisions and gravity.
 */

var CANNON = require('cannon');

module.exports = {
  schema: {
    width:          { default: 1 },
    height:         { default: 1 },
    depth:          { default: 1 },

    mass:           { default: 5 },
    linearDamping:  { default: 0.01 },
    angularDamping: { default: 0.01 }
  },
  init: function () {
    var physics = this.el.sceneEl.components.physics;
    if (!physics) {
      this.el.sceneEl.addEventListener('physics-loaded', this.init.bind(this));
      return;
    }

    var el = this.el,
        data = this.data,
        pos = el.getAttribute('position');

    var halfExtents = new CANNON.Vec3(data.width / 2, data.height / 2, data.depth / 2);
    this.body = new CANNON.Body({
      shape: new CANNON.Box(halfExtents),
      material: physics.material,
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      mass: data.mass,
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
    );
    this.body.quaternion.normalize();

    // Show wireframe
    if (physics.data.debug) {
      var mesh = CANNON.shape2mesh(this.body).children[0];
      this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);
      this.syncWireframe();
      this.el.sceneEl.object3D.add(this.wireframe);
    }

    physics.registerBody(this.body);
    if (this.el.sceneEl.addBehavior) el.sceneEl.addBehavior(this);
    console.info('[rigid-body] loaded');
  },
  remove: function () {},

  update: function () { this.tick(); },
  tick: function () {
    var physics = this.el.sceneEl.components.physics;
    if (physics && physics.data.debug) {
      this.syncWireframe();
    }
  },

  syncWireframe: function () {
      this.wireframe.quaternion.copy(this.body.quaternion);
      this.wireframe.position.copy(this.body.position);
      this.wireframe.updateMatrix();
  }
};
