var OIMO = require('../../lib/Oimo.rev');

var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

AFRAME.registerComponent('keyboard-controls', require('aframe-keyboard-controls'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));

/* Physics setup
——————————————————————————————————————————————*/

var world = new OIMO.World(),
    debug = false;

/* Scene physics
——————————————————————————————————————————————*/

var wallIndex = 1;

AFRAME.registerComponent('terrain-body', {
  init: function () {
    this.body = new OIMO.Body({
      world: world,
      size: [400, 10, 400],
      pos: [0, (-5 + 1.764), 0],
      flat: true
    });

    this.el.sceneEl.addBehavior(this);
  },
  update: function () { this.tick(); },
  tick: function () {
    if (debug) console.log('[terrain-body] position-y: %f', this.body.getPosition().y);
  },
  remove: function () {}
});

AFRAME.registerComponent('wall-body', {
  init: function () {
    var geom = this.el.getAttribute('geometry'),
        pos = this.el.getAttribute('position');

    this.body = new OIMO.Body({
      name: 'wall' + (wallIndex++),
      world: world,
      type: 'box',
      pos: [pos.x, pos.y, pos.z],
      size: [geom.width, geom.height, geom.depth],
      move:  false,
      config: [
                   // Tell me again how good code is self-documenting. 😒
        1,         // The density of the shape.
        0.4,       // The coefficient of friction of the shape.
        0.2,       // The coefficient of restitution of the shape.
        1,         // The bits of the collision groups to which the shape belongs.
        0xffffffff // The bits of the collision groups with which the shape collides.
      ]
    });

    this.el.sceneEl.addBehavior(this);
  },
  update: function () { this.tick(); },
  tick: function () {
    if (debug) console.log('[wall-body] position-y: %f', this.body.getPosition().y);
  },
  remove: function () {}
});

/* Player physics
——————————————————————————————————————————————*/

var hasPlayer = false;

AFRAME.registerComponent('player-body', {
  init:  function () {
    if (hasPlayer) {
      throw new Error('Multiple player-body instances not yet supported.');
    }

    var pos = this.el.getAttribute('position');

    this.body = new OIMO.Body({
      name: 'player',
      world: world,
      type: 'box',
      pos: [pos.x, pos.y, pos.z],
      size: [0.5, 1.764, 0.5],
      move:  true,
      config: [
        1,         // The density of the shape.
        0.4,       // The coefficient of friction of the shape.
        0.2,       // The coefficient of restitution of the shape.
        1,         // The bits of the collision groups to which the shape belongs.
        0xffffffff // The bits of the collision groups with which the shape collides.
      ]
    });

    this.el.sceneEl.addBehavior(this);

    hasPlayer = true;
  },
  update: function () { this.tick(); },
  tick: function () {
    if (debug) console.log('[player-body] position-y: %f', this.body.getPosition().y);
    this.el.object3D.position.copy(this.body.getPosition());
    // this.el.object3D.quaternion.copy(this.body.getQuaternion());
    
    // var controls = this.el.components['keyboard-controls'];
    // if (controls.isPressed('KeyW')) this.body.linearVelocity.x += 0.1;
    // if (controls.isPressed('KeyA')) this.body.linearVelocity.z += 0.1;
    // if (controls.isPressed('KeyS')) this.body.linearVelocity.x -= 0.1;
    // if (controls.isPressed('KeyD')) this.body.linearVelocity.z -= 0.1;
  }
});

/* Start
——————————————————————————————————————————————*/

setInterval(function () {
  world.step();
}, 1000 / 60);
