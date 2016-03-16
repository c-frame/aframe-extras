/**
 * Dynamic body.
 *
 * Moves according to physics simulation, and may collide with other objects.
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
      // TODO - Quaternion->Euler conversion leaves something to be desired.
      throw new Error('[dynamic-body] Preset rotation not yet supported.');
    }

    // Show wireframe
    if (physics.data.debug) {
      var mesh = CANNON.shape2mesh(this.body).children[0];
      this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);
      this.el.sceneEl.object3D.add(this.wireframe);
    }

    physics.registerBody(this.body);
    if (this.el.sceneEl.addBehavior) this.el.sceneEl.addBehavior(this);
    console.info('[dynamic-body] loaded');
  },
  remove: function () {},
  update: function () { this.tick(); },
  tick: function () {
    var physics = this.el.sceneEl.components.physics;
    if (!physics) return;

    // Update mesh
    // this.body.quaternion.toEuler(this.euler, 'YZX' /* XYZ not supported */);
    // this.euler.x = THREE.Math.radToDeg(this.euler.x);
    // this.euler.y = THREE.Math.radToDeg(this.euler.y);
    // this.euler.z = THREE.Math.radToDeg(this.euler.z);
    // this.el.setAttribute('rotation', {x: this.euler.x, y: this.euler.y, z: this.euler.z});

    this.el.object3D.quaternion.copy(this.body.quaternion);
    this.el.setAttribute('position', this.body.position);

    // Update wireframe
    if (physics.data.debug) {
      this.wireframe.quaternion.copy(this.body.quaternion);
      this.wireframe.position.copy(this.body.position);
      this.wireframe.updateMatrix();
    }
  }
};
