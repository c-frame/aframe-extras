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
    this.body.position.y -= (data.height - data.radius); // TODO - Simplify.

    physics.addBody(this.body);
    if (el.sceneEl.addBehavior) el.sceneEl.addBehavior(this);
    console.info('[kinematic-body] loaded');
  },

  remove: function () {
    var physics = this.el.sceneEl.components.physics;
    if (physics) physics.removeBody(this.body);
  },

  /*******************************************************************
   * Tick
   */

  update: (function () {
    var prevTime = NaN;

    return function () {
      var t = Date.now();
      this.tick(t, t - prevTime);
      prevTime = t;
    };
  }()),

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
        surfaceNormal = new THREE.Vector3();

    return function (t, dt) {
      if (!this.body) return;

      var body = this.body,
          data = this.data,
          world = this.el.sceneEl.components.physics.world,
          isCollidingWithGround = false,
          groundNormal;

      velocity.copy(this.el.getAttribute('velocity'));

      body.velocity.copy(velocity);
      body.position.copy(this.el.getAttribute('position'));
      body.position.y -= (data.height - data.radius); // TODO - Simplify.

      for (var i = 0, contact; (contact = world.contacts[i]); i++) {
        // 1. Find any collisions involving this element. Get the contact
        // normal, and make sure it's oriented _out_ of the other object.
        if (body.id === contact.bi.id) {
          contact.ni.negate(surfaceNormal);
        } else if (body.id === contact.bj.id) {
          surfaceNormal.copy(contact.ni);
        } else {
          continue;
        }

        if (body.velocity.dot(surfaceNormal) < -EPS) {
          // 2. If current trajectory attempts to move _through_ another
          // object, project the velocity against the collision plane to
          // prevent passing through. If colliding with something roughly
          // horizontal (+/- 45º), then consider that the current 'ground.'
          isCollidingWithGround = isCollidingWithGround || surfaceNormal.y > 0.5;
          velocity = velocity.projectOnPlane(surfaceNormal);
        } else if (surfaceNormal.y > 0.5) {
          // 3. If in contact with something but not trying to pass through it,
          // and that something is horizontal, +/- 45º, then store it in case
          // there's no other 'ground' available.
          groundNormal = surfaceNormal;
        }
      }

      if (!isCollidingWithGround && groundNormal) {
        // 4. If not colliding with anything horizontal, but still in contact
        // with a horizontal surface, pretend it's a collision.
        //
        // TODO - This prevents jumping, but it also prevents awkward bobbling
        // while moving on ramps. Probably fixable by checking the angle.
        velocity = velocity.projectOnPlane(groundNormal);
      } else if (!isCollidingWithGround) {
        // 5. If not in contact with anything horizontal, apply world gravity.
        // TODO - Why is the 4x scalar necessary.
        velocity.add(world.gravity.scale(dt * 4.0 / 1000));
      }

      body.velocity.copy(velocity);
      this.el.setAttribute('velocity', velocity);
    };
  }())
};
