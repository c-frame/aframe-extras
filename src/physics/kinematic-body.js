/**
 * Kinematic body.
 *
 * Managed dynamic body, which moves but is not affected (directly) by the
 * physics engine. This is not a true kinematic body, in the sense that we are
 * letting the physics engine _compute_ collisions against it and selectively
 * applying those collisions to the object. The physics engine does not decide
 * the position/velocity/rotation of the element.
 *
 * Used for the camera object, because full physics simulation would create
 * movement that feels unnatural to the player. Bipedal movement does not
 * translate nicely to rigid body physics.
 *
 * See: http://www.learn-cocos2d.com/2013/08/physics-engine-platformer-terrible-idea/
 */
var CANNON = require('cannon');

var EPS = 0.000001;

module.exports = {

  /*******************************************************************
   * Schema
   */

  schema: {
    mass:           { default: 5 },
    radius:         { default: 1.3 },
    height:         { default: 1.764 },
    linearDamping:  { default: 0.05 }
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
        position = (new CANNON.Vec3()).copy(el.getAttribute('position'));

    this.body = new CANNON.Body({
      shape: new CANNON.Sphere(data.radius),
      material: physics.material,
      position: position,
      mass: data.mass,
      linearDamping: data.linearDamping,
      fixedRotation: true
    });
    this.body.position.y -= (data.height - data.radius); // TODO - Simplify.

    physics.addBody(this.body);
    console.info('[kinematic-body] loaded');
  },

  remove: function () {
    var physics = this.el.sceneEl.components.physics;
    if (physics) physics.removeBody(this.body);
  },

  /*******************************************************************
   * Tick
   */

  /**
   * Checks CANNON.World for collisions and attempts to apply them to the
   * element automatically, in a player-friendly way.
   *
   * There's extra logic for horizontal surfaces here. The basic requirements:
   * (1) Only apply gravity when not in contact with _any_ horizontal surface.
   * (2) When moving, project the velocity against exactly one ground surface.
   *     If in contact with two ground surfaces (e.g. ground + ramp), choose
   *     the one that collides with current velocity, if any.
   */
  tick: (function () {
    var velocity = new THREE.Vector3(),
        currentSurfaceNormal = new THREE.Vector3(),
        groundNormal = new THREE.Vector3();

    return function (t, dt) {
      if (!this.body || isNaN(dt)) return;

      var body = this.body,
          data = this.data,
          physics = this.el.sceneEl.components.physics,
          didCollideWithGround = false,
          groundBody;

      dt = Math.min(dt, physics.data.maxInterval * 1000);

      groundNormal.set(0, 0, 0);
      velocity.copy(this.el.getAttribute('velocity'));
      body.velocity.copy(velocity);
      body.position.copy(this.el.getAttribute('position'));

      for (var i = 0, contact; (contact = physics.world.contacts[i]); i++) {
        // 1. Find any collisions involving this element. Get the contact
        // normal, and make sure it's oriented _out_ of the other object.
        if (body.id === contact.bi.id) {
          contact.ni.negate(currentSurfaceNormal);
        } else if (body.id === contact.bj.id) {
          currentSurfaceNormal.copy(contact.ni);
        } else {
          continue;
        }

        if (body.velocity.dot(currentSurfaceNormal) < -EPS) {
          // 2. If current trajectory attempts to move _through_ another
          // object, project the velocity against the collision plane to
          // prevent passing through.
          velocity = velocity.projectOnPlane(currentSurfaceNormal);

          // 3.If colliding with something roughly horizontal (+/- 45º), then
          // consider that the current 'ground.'
          if (currentSurfaceNormal.y > 0.5) {
            didCollideWithGround = true;
            groundNormal.copy(currentSurfaceNormal);
            groundBody = body.id === contact.bi.id ? contact.bj : contact.bi;
          }
        } else if (currentSurfaceNormal.y > 0.5 && !groundBody) {
          // 4. If in contact with something but not trying to pass through it,
          // and that something is horizontal, +/- 45º, then store it in case
          // there's no other 'ground' available.
          groundNormal.copy(currentSurfaceNormal);
          groundBody = body.id === contact.bi.id ? contact.bj : contact.bi;
        }
      }

      if (!didCollideWithGround && groundNormal.y && velocity.y < EPS) {
        // 5. If not colliding with anything horizontal, but still in contact
        // with a horizontal surface, pretend it's a collision. Ignore this if
        // vertical velocity is > 0, to allow jumping.
        velocity = velocity.projectOnPlane(groundNormal);
      } else if (!didCollideWithGround) {
        // 6. If not in contact with anything horizontal, apply world gravity.
        // TODO - Why is the 4x scalar necessary.
        velocity.add(physics.world.gravity.scale(dt * 4.0 / 1000));
      }

      // 7. If the ground surface has a velocity, apply it directly to current
      // position, not velocity, to preserve relative velocity.
      if (groundBody && groundBody.el && groundBody.el.components.velocity) {
        var groundVelocity = groundBody.el.getAttribute('velocity');
        body.position.copy({
          x: body.position.x + groundVelocity.x * dt / 1000,
          y: body.position.y + groundVelocity.y * dt / 1000,
          z: body.position.z + groundVelocity.z * dt / 1000
        });
        this.el.setAttribute('position', body.position);
      }

      body.position.y -= (data.height - data.radius); // TODO - Simplify.
      body.velocity.copy(velocity);
      this.el.setAttribute('velocity', velocity);
    };
  }())
};
