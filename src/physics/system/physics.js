var CANNON = require('cannon');

var OPTIONS = {
  friction:     0.01,
  restitution:  0.3,
  iterations:   5,
  gravity:      -9.8,

  // Never step more than four frames at once. Effectively pauses the scene
  // when out of focus, and prevents weird "jumps" when focus returns.
  maxInterval:  4 / 60,

  // If true, show wireframes around physics bodies.
  debug:        false
};

/**
 * Physics system.
 */
module.exports = {
  /**
   * Update phases, used to separate physics simulation from updates to A-Frame scene.
   * @enum {string}
   */
  Phase: {
    SIMULATE: 'sim',
    RENDER:   'render'
  },

  init: function () {
    this.options = AFRAME.utils.extend({}, OPTIONS);

    this.children = {};
    this.children[this.Phase.SIMULATE] = [];
    this.children[this.Phase.RENDER] = [];

    this.world = new CANNON.World();
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;
    // this.world.solver.setSpookParams(300,10);
    this.world.solver.iterations = this.options.iterations;
    this.world.gravity.set(0, this.options.gravity, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    this.material = new CANNON.Material('slipperyMaterial');
    this.contactMaterial = new CANNON.ContactMaterial(this.material, this.material, {
        friction: this.options.friction,
        restitution: this.options.restitution
    });
    this.world.addContactMaterial(this.contactMaterial);
  },

  setOption: function (opt, value) {
    this.options[opt] = value;
    switch (opt) {
      case 'maxInterval':
        break; // no-op
      case 'friction':
      case 'restitution':
      case 'iterations':
      case 'gravity':
      case 'debug':
        console.warn('Option "%s" cannot yet be dynamically updated.', opt);
        break;
      default:
        console.error('Option "%s" not recognized.', opt);
    }
  },

  tick: function (t, dt) {
    if (isNaN(dt)) return;

    this.world.step(Math.min(dt / 1000, this.options.maxInterval));

    var i;
    for (i = 0; i < this.children[this.Phase.SIMULATE].length; i++) {
      this.children[this.Phase.SIMULATE][i].step(t, dt);
    }

    for (i = 0; i < this.children[this.Phase.RENDER].length; i++) {
      this.children[this.Phase.RENDER][i].step(t, dt);
    }
  },

  addBody: function (body) {
    this.world.addBody(body);
  },

  removeBody: function (body) {
    this.world.removeBody(body);
  },

  addBehavior: function (component, phase) {
    this.children[phase].push(component);
  },

  removeBehavior: function (component, phase) {
    this.children[phase].splice(this.children[phase].indexOf(component), 1);
  }
};
