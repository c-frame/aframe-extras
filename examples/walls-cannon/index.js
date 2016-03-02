var CANNON = require('cannon');

var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

AFRAME.registerComponent('keyboard-controls', require('aframe-keyboard-controls'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));

/* Physics
——————————————————————————————————————————————*/

AFRAME.registerComponent('physics', {
  schema: {
    friction: {default: 0.0},
    restitution: {default: 0.3},
    iterations: {default: 5},
    gravity: {default: -9.8}
  },
  init: function () {
    this.validate();

    var world = this.world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;
    // world.solver.setSpookParams(300,10);
    world.solver.iterations = this.data.iterations;
    world.gravity.set(0, this.data.gravity, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    this.material = new CANNON.Material('slipperyMaterial');
    this.contactMaterial = new CANNON.ContactMaterial(this.material, this.material, {
        friction: this.data.friction,
        restitution: this.data.restitution
    });
    world.addContactMaterial(this.contactMaterial);

    this.el.addBehavior(this);

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
  remove: function () {}
});

/* Rigid body
——————————————————————————————————————————————*/

AFRAME.registerComponent('rigid-body', {
  schema: {
    mass: {default: 500},
    linearDamping: {default: 0.01},
    angularDamping: {default: 0.01}
  },
  init: function () {
    var physics = this.el.sceneEl.components.physics;
    if (physics) {
      var geom = this.el.getAttribute('geometry'),
          pos = this.el.getAttribute('position');

      var halfExtents = new CANNON.Vec3(geom.width / 2, geom.height / 2, geom.depth / 2);
      this.body = new CANNON.Body({
        shape: new CANNON.Box(halfExtents), 
        material: physics.material,
        position: new CANNON.Vec3(pos.x, pos.y, pos.z),
        mass: this.data.mass,
        linearDamping: this.data.linearDamping,
        angularDamping: this.data.angularDamping
      });
      physics.world.add(this.body);

      this.el.sceneEl.addBehavior(this);
      console.info('[ground-body] loaded');
    } else {
      this.el.sceneEl.addEventListener('physics-loaded', this.init.bind(this));
    }  
  },
  update: function () { this.tick(); },
  tick: function () {
    if (this.body) {
      this.el.setAttribute('position', this.body.position);
    }
  },
  remove: function () {}
});

/* Plane body
——————————————————————————————————————————————*/


AFRAME.registerComponent('ground-body', {
  init: function () {
    var physics = this.el.sceneEl.components.physics;
    if (physics) {
      this.body = new CANNON.Body({
        shape: new CANNON.Plane(), 
        material: physics.material,
        mass: 0
      });
      this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
      physics.world.add(this.body);

      this.el.sceneEl.addBehavior(this);
    } else {
      this.el.sceneEl.addEventListener('physics-loaded', this.init.bind(this));
    }
  },
  update: function () { this.tick(); },
  tick: function () {},
  remove: function () {}
});


/* Sphere body
——————————————————————————————————————————————*/

AFRAME.registerComponent('fps-controls', {
  dependencies: ['position', 'keyboard-controls', 'gamepad-controls'],
  schema: {
    mass: {default: 5},
    radius: {default: 1.3},
    linearDamping: {default: 0.05}
  },
  init: function () {
    var physics = this.el.sceneEl.components.physics;
    if (physics) {
      var position = (new CANNON.Vec3()).copy(this.el.getAttribute('position'));
      this.body = new CANNON.Body({
        shape: new CANNON.Sphere(this.data.radius),
        material: physics.material,
        position: position,
        mass: this.data.mass,
        linearDamping: this.data.linearDamping
      });
      physics.world.add(this.body);

      this.el.sceneEl.addBehavior(this);
    } else {
      this.el.sceneEl.addEventListener('physics-loaded', this.init.bind(this));
    }
  },
  update: function () { this.tick(); },
  tick: function () {
    if (this.body) {
      var keyboardControls = this.el.components['keyboard-controls'];

      if (keyboardControls.isPressed('Space')) this.body.velocity.y = 15;

      if (keyboardControls.isPressed('KeyW')) this.body.velocity.z = -1;
      else if (keyboardControls.isPressed('KeyS')) this.body.velocity.z = 1;
      else this.body.velocity.z = 0;

      if (keyboardControls.isPressed('KeyA')) this.body.velocity.x = -1;
      else if (keyboardControls.isPressed('KeyD')) this.body.velocity.x = 1;
      else this.body.velocity.x = 0;

      this.el.setAttribute('position', this.body.position);

    }
  },
  remove: function () {}
});
