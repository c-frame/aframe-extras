var CANNON = require('cannon');

module.exports = {
  schema: {
    friction: {default: 0.0},
    restitution: {default: 0.3},
    iterations: {default: 5},
    gravity: {default: -9.8}
  },
  init: function () {
    this.validate();

    this.world = new CANNON.World();
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;
    // this.world.solver.setSpookParams(300,10);
    this.world.solver.iterations = this.data.iterations;
    this.world.gravity.set(0, this.data.gravity, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    this.material = new CANNON.Material('slipperyMaterial');
    this.contactMaterial = new CANNON.ContactMaterial(this.material, this.material, {
        friction: this.data.friction,
        restitution: this.data.restitution
    });
    this.world.addContactMaterial(this.contactMaterial);

    if (this.el.addBehavior) this.el.addBehavior(this);

    // Delayed, in the hope that A-Frame will mount the component before the
    // event is emitted.
    setTimeout(function () { this.el.emit('physics-loaded'); }.bind(this), 0);
  },
  validate: function () {
    if (this.el.tagName !== 'A-SCENE') {
      throw new Error('Physics must be attached to a scene instance.');
    }
  },
  update: function () {
    var t1 = Date.now();
    if (this.t0) this.tick(t1, t1 - this.t0);
    this.t0 = t1;
  },
  tick: function (t, tDelta) {
    this.world.step(tDelta / (60 * 2));
  },
  remove: function () {},

  /*******************************************************************
   * Interface
   */

  registerRigidBody: function (body) {
    this.world.add(body);
  }
};
