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
 * And: http://oxleygamedev.blogspot.com/2011/04/player-physics-part-2.html
 */
var CANNON = window.CANNON;
var EPS = 0.000001;

module.exports = {
  dependencies: ['velocity'],

  /*******************************************************************
   * Schema
   */

  schema: {
    mass:           { default: 5 },
    radius:         { default: 1.3 },
    height:         { default: 1.764 },
    linearDamping:  { default: 0.05 },
    enableSlopes:   { default: true }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    this.system = this.el.sceneEl.systems.physics;
    this.system.addBehavior(this, this.system.Phase.SIMULATE);

    var el = this.el,
        data = this.data,
        position = (new CANNON.Vec3()).copy(el.getAttribute('position'));

    this.body = new CANNON.Body({
      material: this.system.material,
      position: position,
      mass: data.mass,
      linearDamping: data.linearDamping,
      fixedRotation: true
    });
    this.body.addShape(
      new CANNON.Sphere(data.radius),
      new CANNON.Vec3(0, data.radius - data.height, 0)
    );

    this.body.el = this.el;
    this.el.body = this.body;
    this.system.addBody(this.body);
  },

  remove: function () {
    this.system.removeBody(this.body);
    this.system.removeBehavior(this, this.system.Phase.SIMULATE);
    delete this.el.body;
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
  step: (function () {
    var velocity = new THREE.Vector3(),
        normalizedVelocity = new THREE.Vector3(),
        currentSurfaceNormal = new THREE.Vector3(),
        groundNormal = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      var body = this.body,
          data = this.data,
          didCollide = false,
          height, groundHeight = -Infinity,
          groundBody;

      dt = Math.min(dt, this.system.data.maxInterval * 1000);

      groundNormal.set(0, 0, 0);
      velocity.copy(this.el.getAttribute('velocity'));
      body.velocity.copy(velocity);
      body.position.copy(this.el.getAttribute('position'));

      for (var i = 0, contact; (contact = this.system.world.contacts[i]); i++) {
        // 1. Find any collisions involving this element. Get the contact
        // normal, and make sure it's oriented _out_ of the other object.
        if (body.id === contact.bi.id) {
          contact.ni.negate(currentSurfaceNormal);
        } else if (body.id === contact.bj.id) {
          currentSurfaceNormal.copy(contact.ni);
        } else {
          continue;
        }

        didCollide = body.velocity.dot(currentSurfaceNormal) < -EPS;
        if (didCollide && currentSurfaceNormal.y <= 0.5) {
          // 2. If current trajectory attempts to move _through_ another
          // object, project the velocity against the collision plane to
          // prevent passing through.
          velocity = velocity.projectOnPlane(currentSurfaceNormal);
        } else if (currentSurfaceNormal.y > 0.5) {
          // 3. If in contact with something roughly horizontal (+/- 45º) then
          // consider that the current ground. Only the highest qualifying
          // ground is retained.
          height = body.id === contact.bi.id
            ? Math.abs(contact.rj.y + contact.bj.position.y)
            : Math.abs(contact.ri.y + contact.bi.position.y);
          if (height > groundHeight) {
            groundHeight = height;
            groundNormal.copy(currentSurfaceNormal);
            groundBody = body.id === contact.bi.id ? contact.bj : contact.bi;
          }
        }
      }

      normalizedVelocity.copy(velocity).normalize();
      if (groundBody && normalizedVelocity.y < 0.5) {
        if (!data.enableSlopes) {
          groundNormal.set(0, 1, 0);
        } else if (groundNormal.y < 1 - EPS) {
          groundNormal.copy(this.raycastToGround(groundBody, groundNormal));
        }

        // 4. Project trajectory onto the top-most ground object, unless
        // trajectory is > 45º.
        velocity = velocity.projectOnPlane(groundNormal);
      } else {
        // 5. If not in contact with anything horizontal, apply world gravity.
        // TODO - Why is the 4x scalar necessary.
        velocity.add(this.system.world.gravity.scale(dt * 4.0 / 1000));
      }

      // 6. If the ground surface has a velocity, apply it directly to current
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

      body.velocity.copy(velocity);
      this.el.setAttribute('velocity', velocity);
    };
  }()),

  /**
   * When walking on complex surfaces (trimeshes, borders between two shapes),
   * the collision normals returned for the player sphere can be very
   * inconsistent. To address this, raycast straight down, find the collision
   * normal, and return whichever normal is more vertical.
   * @param  {CANNON.Body} groundBody
   * @param  {CANNON.Vec3} groundNormal
   * @return {CANNON.Vec3}
   */
  raycastToGround: function (groundBody, groundNormal) {
    var ray,
        hitNormal,
        vFrom = this.body.position,
        vTo = this.body.position.clone();

    vTo.y -= this.data.height;
    ray = new CANNON.Ray(vFrom, vTo);
    ray._updateDirection(); // TODO - Report bug.
    ray.intersectBody(groundBody);

    if (!ray.hasHit) return groundNormal;

    // Compare ABS, in case we're projecting against the inside of the face.
    hitNormal = ray.result.hitNormalWorld;
    return Math.abs(hitNormal.y) > Math.abs(groundNormal.y) ? hitNormal : groundNormal;
  }
};
