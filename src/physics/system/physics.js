var CANNON = require('cannon'),
    CONSTANTS = require('../constants'),
    C_MAT = CONSTANTS.CONTACT_MATERIAL;

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

  /**
   * Initializes the physics system.
   */
  init: function () {
    // Never step more than four frames at once. Effectively pauses the scene
    // when out of focus, and prevents weird "jumps" when focus returns.
    this.maxInterval = CONSTANTS.MAX_INTERVAL;

    // If true, show wireframes around physics bodies.
    this.debug = false;

    this.children = {};
    this.children[this.Phase.SIMULATE] = [];
    this.children[this.Phase.RENDER] = [];

    this.listeners = {};

    this.world = new CANNON.World();
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;
    // this.world.solver.setSpookParams(300,10);
    this.world.solver.iterations = CONSTANTS.ITERATIONS;
    this.world.gravity.set(0, CONSTANTS.GRAVITY, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    this.material = new CANNON.Material({name: 'defaultMaterial'});
    this.contactMaterial = new CANNON.ContactMaterial(this.material, this.material, {
        friction: C_MAT.friction,
        restitution: C_MAT.restitution,
        contactEquationStiffness: C_MAT.contactEquationStiffness,
        contactEquationRelaxation: C_MAT.contactEquationRelaxation,
        frictionEquationStiffness: C_MAT.frictionEquationStiffness,
        frictionEquationRegularization: C_MAT.frictionEquationRegularization
    });
    this.world.addContactMaterial(this.contactMaterial);
  },

  /**
   * Updates the physics world on each tick of the A-Frame scene. It would be
   * entirely possible to separate the two – updating physics more or less
   * frequently than the scene – if greater precision or performance were
   * necessary.
   * @param  {number} t
   * @param  {number} dt
   */
  tick: function (t, dt) {
    if (isNaN(dt)) return;

    this.world.step(Math.min(dt / 1000, this.maxInterval));

    var i;
    for (i = 0; i < this.children[this.Phase.SIMULATE].length; i++) {
      this.children[this.Phase.SIMULATE][i].step(t, dt);
    }

    for (i = 0; i < this.children[this.Phase.RENDER].length; i++) {
      this.children[this.Phase.RENDER][i].step(t, dt);
    }
  },

  /**
   * Adds a body to the scene, and binds collision events to the element.
   * @param {CANNON.Body} body
   */
  addBody: function (body) {
    this.listeners[body.id] = function (e) { body.el.emit('collide', e); };
    body.addEventListener('collide', this.listeners[body.id]);
    this.world.addBody(body);
  },

  /**
   * Removes a body, and its listeners, from the scene.
   * @param {CANNON.Body} body
   */
  removeBody: function (body) {
    body.removeEventListener('collide', this.listeners[body.id]);
    delete this.listeners[body.id];
    this.world.removeBody(body);
  },

  /**
   * Adds a component instance to the system, to be invoked on each tick during
   * the given phase.
   * @param {Component} component
   * @param {string} phase
   */
  addBehavior: function (component, phase) {
    this.children[phase].push(component);
  },

  /**
   * Removes a component instance from the system.
   * @param {Component} component
   * @param {string} phase
   */
  removeBehavior: function (component, phase) {
    this.children[phase].splice(this.children[phase].indexOf(component), 1);
  },

  /**
   * Sets an option on the physics system, affecting future simulation steps.
   * @param {string} opt
   * @param {mixed} value
   */
  setOption: function (opt, value) {
    switch (opt) {
      case 'maxInterval': return this.setMaxInterval(value);
      case 'gravity':     return this.setGravity(value);
      case 'debug':       return this.setDebug(value);
      case 'friction':
      case 'restitution':
      case 'contactEquationStiffness':
      case 'contactEquationRelaxation':
      case 'frictionEquationStiffness':
      case 'frictionEquationRegularization':
        return this.setContactMaterialProperty(opt, value);
      default:
        console.error('Option "%s" not recognized.', opt);
    }
  },

  setMaxInterval: function (maxInterval) {
    this.maxInterval = maxInterval;
  },

  setGravity: function (gravity) {
    this.world.gravity.y = gravity;
  },

  setDebug: function (debug) {
    this.debug = debug;
    console.warn('[physics] Option "debug" cannot be dynamically updated yet');
  },

  setContactMaterialProperty: function (prop, value) {
    this.contactMaterial[prop] = value;
  }
};
