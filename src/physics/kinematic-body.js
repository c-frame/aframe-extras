/**
 * Kinematic body.
 *
 * Managed dynamic body, which moves but is not affected by outside forces.
 * This implementation differs from that of CANNON.js, in that it trigger
 * collision events and apply impulses to other bodies, but is not itself
 * affected by these impulses.
 *
 * Used for the player, because full physics simulation would be both
 * impractical and limiting.
 *
 * See: http://www.learn-cocos2d.com/2013/08/physics-engine-platformer-terrible-idea/
 */
var CANNON = require('cannon');

var EPS = 0.000001;

module.exports = {
  schema: {
    mass:           { default: 5 },
    radius:         { default: 1.3 },
    height:         { default: 1.764 },
    linearDamping:  { default: 0.05 }
  },
  init: function () {
    var physics = this.el.sceneEl.components.physics;

    if (!physics) {
      this.el.sceneEl.addEventListener('physics-loaded', this.init.bind(this));
      return;
    }

    var el = this.el,
        data = this.data,
        position = (new CANNON.Vec3()).copy(el.getAttribute('position'));

    this.body = new CANNON.Body({
      shape: new CANNON.Sphere(data.radius),
      material: physics.material,
      position: position,
      mass: data.mass,
      linearDamping: data.linearDamping,
      fixedRotation: true
    });
    this.body.position.y -= (data.height - data.radius); // TODO - simplify.

    physics.registerBody(this.body);
    if (el.sceneEl.addBehavior) el.sceneEl.addBehavior(this);
    console.info('[kinematic-body] loaded');
  },
  remove: function () {},

  update: (function () {
    var prevTime = NaN;

    return function () {
      var t = Date.now();
      this.tick(t, t - prevTime);
      prevTime = t;
    };
  }()),

  tick: function (t, dt) {
    if (!this.body) return;

    var body = this.body,
        data = this.data,
        dVelocity, surfaceNormal,
        velocity = this.el.getAttribute('velocity'),
        world = this.el.sceneEl.components.physics.world,
        contacts = world.contacts;

    body.velocity.copy(velocity);
    body.position.copy(this.el.getAttribute('position'));
    this.body.position.y -= (data.height - data.radius); // TODO - simplify.

    for (var i = 0, contact, dot; (contact = contacts[i]); i++) {
      if (body.id === contact.bi.id || body.id === contact.bj.id) {
        dot = body.velocity.dot(contact.ni);
        if (dot >= 0) {
          dVelocity = new THREE.Vector3();
          dVelocity.copy(contact.ni).multiplyScalar(dot);
          velocity.x -= dVelocity.x;
          velocity.y -= dVelocity.y;
          velocity.z -= dVelocity.z;
        }
        if (Math.abs(contact.ni.y) > EPS) {
          surfaceNormal = new THREE.Vector3(contact.ni.x, contact.ni.y, contact.ni.z);
        }
      }
    }

    // TODO - Could have contact with multiple (many?) other bodies where
    // n.y is nonzero. Collect them all, raycast down, and choose the one
    // that is intersected.

    if (surfaceNormal
        && (Math.abs(surfaceNormal.x) > EPS || Math.abs(surfaceNormal.z) > EPS)) {
      var n = surfaceNormal,
          v = new THREE.Vector3(velocity.x, velocity.y, velocity.z);

      // TODO - weird wobble when you stop moving up a plane, but this fixes
      // an issue when trying to jump off a slope. Maybe the thing here is to
      // consider velocity relative to surface? Or?
      // if (v.dot(n) > 0) {

      // Keep only projection of the velocity onto the surface.
      velocity = v.sub(n.multiplyScalar(v.dot(n) / n.lengthSq()));

      // }
    }

    if (!surfaceNormal) {
      var k = 5.0; // TODO - Why is this factor necessary.
      velocity.x += world.gravity.x * dt * k / 1000;
      velocity.y += world.gravity.y * dt * k / 1000;
      velocity.z += world.gravity.z * dt * k / 1000;
    }

    body.velocity.copy(velocity);
    this.el.setAttribute('velocity', velocity);
  }
};
