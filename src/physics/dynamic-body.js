/**
 * Rigid body.
 *
 * Solid body without deformation, but which is subject to collisions and gravity.
 */

var CANNON = require('cannon'),
    AFRAME = window.AFRAME;

module.exports = {
  schema: {
    mass: { default: 5 },
    radius: { default: 1.3 },
    linearDamping: { default: 0.05 }
  },
  init: function () {
    var physics = this.el.sceneEl.components.physics;

    if (!physics) {
      this.el.sceneEl.addEventListener('physics-loaded', this.init.bind(this));
      return;
    }

    var el = this.el,
        position = (new CANNON.Vec3()).copy(el.getAttribute('position'));

    this.body = new CANNON.Body({
      shape: new CANNON.Sphere(this.data.radius),
      material: physics.material,
      position: position,
      mass: this.data.mass,
      linearDamping: this.data.linearDamping
    });

    physics.registerBody(this.body);
    if (el.sceneEl.addBehavior) el.sceneEl.addBehavior(this);
    console.info('[dynamic-body] loaded');
  },
  remove: function () {},

  update: function () { this.tick(); },
  tick: function () {
    if (!this.body) return;

    var body = this.body,
        dVelocity = new THREE.Vector3(),
        velocity = this.el.getAttribute('velocity'),
        world = this.el.sceneEl.components.physics.world,
        contacts = world.contacts;

    body.position.copy(this.el.getAttribute('position'));
    body.velocity.copy(velocity);

    for (var i = 0, contact, dot; (contact = contacts[i]); i++) {
      if (body.id === contact.bi.id || body.id === contact.bj.id) {
        dot = body.velocity.dot(contact.ni);
        if (dot >= 0) {
          dVelocity.copy(contact.ni).multiplyScalar(dot);
          velocity.x -= dVelocity.x;
          velocity.y -= dVelocity.y;
          velocity.z -= dVelocity.z;
        }
      }
    }

    this.el.setAttribute('velocity', velocity);
  }
};
