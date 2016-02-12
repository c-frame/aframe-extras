/**
 * Adds jump ability on component.
 */

var ACCEL_G = -9.8; // m/s^2
    
module.exports = {
  dependencies: ['position'],

  /* Schema
   —————————————————————————————————————————————*/

  schema: {
    on: { default: 'keydown:Space' },
    playerHeight: { default: 1.764 },
    enableDoubleJump: { default: false },
    distance: { default: 10 }
  },

  /* Init / Deinit
   —————————————————————————————————————————————*/

  init: function () {
    this.position = new THREE.Vector3();
    this.isStanding = true;
    this.velocity = 0;
    this.numJumps = 0;
    
    this.bindings = {};
    this.bindings[this.data.on] = this.beginJump.bind(this);
    this.el.addEventListener(this.data.on, this.bindings[this.data.on]);
  },

  remove: function () {
    this.el.removeEventListener(this.data.on, this.bindings.beginJump);
  },

  /* Render loop
   —————————————————————————————————————————————*/

  update: function () {
    this.tick();
  },

  tick: function (t, tDelta) {
    if (this.isStanding) return;

    this.position.copy(this.el.getAttribute('position'));
    
    if (this.position.y > this.data.playerHeight || this.velocity > 0) {
      this.midJump(tDelta);
    } else {
      this.endJump();
    }

    this.el.setAttribute('position', this.position);
  },

  /* Jumping
   —————————————————————————————————————————————*/

  beginJump: function () {
    if (this.isStanding || this.data.enableDoubleJump && this.numJumps < 2) {
      this.velocity = 15;
      this.isStanding = false;
      this.numJumps++;
    }
  },

  midJump: function (tDelta) {
    this.position.y = Math.max(
      this.position.y + this.velocity * tDelta / 300,
      this.data.playerHeight
    );
    this.velocity += ACCEL_G * tDelta / 300;
  },

  endJump: function () {
    this.position.y = this.data.playerHeight;
    this.velocity = 0;
    this.numJumps = 0;
    this.isStanding = true;
  }
};
