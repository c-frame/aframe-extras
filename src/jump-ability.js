/**
 * Adds jump ability on component.
 */

var ACCEL_G = -9.8, // m/s^2
    EPS = 0.01; 
    
module.exports = {
  dependencies: ['position'],

  /* Schema
  ——————————————————————————————————————————————*/

  schema: {
    on: { default: 'keydown:Space gamepadbuttondown:0' },
    playerHeight: { default: 1.764 },
    enableDoubleJump: { default: false },
    distance: { default: 10 },
    soundJump: { default: '' },
    soundLand: { default: '' },
    debug: { default: false }
  },

  /* Init / Deinit
  ——————————————————————————————————————————————*/

  init: function () {
    this.position = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster(
      this.position.clone(), new THREE.Vector3(0, -1, 0), 0, this.data.playerHeight + EPS
    );
    this.isOnObject = true;
    this.velocity = 0;
    this.numJumps = 0;
    
    var beginJump = this.beginJump.bind(this),
        events = this.data.on.split(' ');
    this.bindings = {};
    for (var i = 0; i <  events.length; i++) {
      this.bindings[events[i]] = beginJump;
      this.el.addEventListener(events[i], beginJump);
    }

    var scene = this.el.sceneEl;
    if (scene.addBehavior) {
      scene.addBehavior(this);
    }
  },

  remove: function () {
    for (var event in this.bindings) {
      if (this.bindings.hasOwnProperty(event)) {
        this.el.removeEventListener(event, this.bindings[event]);
        delete this.bindings[event];
      }
    }
  },

  /* Render loop
  ——————————————————————————————————————————————*/

  update: (function () {
    var prevTime = NaN;

    return function () {
      var t = Date.now(),
          tDelta = t - prevTime;
      this.tick(t, tDelta);
      prevTime = t;
    };
  }()),

  tick: function (t, tDelta) {
    var terrain = this.getTerrain();

    if (Number.isNaN(tDelta)) return;

    if (!terrain.length) {
      if (this.data.debug) console.warn('[jump-ability] Cannot jump - no terrain found.');
      return;
    }

    this.position.copy(this.el.getAttribute('position'));
    this.raycaster.ray.origin.copy(this.position);
    var intersections = this.raycaster.intersectObjects(terrain, true /* recursive */);
    this.isOnObject = intersections.length > 0;

    if (this.isOnObject && this.velocity < 0) {
      this.velocity = 0;
      this.numJumps = 0;
      if (this.data.soundLand) {
        this.el.querySelector(this.data.soundLand).emit('fire');
      }
    } else if (!this.isOnObject || this.velocity) {
      this.position.y = Math.max(
        this.position.y + this.velocity * tDelta / 300,
        this.data.playerHeight
      );
      this.velocity += ACCEL_G * tDelta / 300;
    }

    this.el.setAttribute('position', this.position);
  },

  /* Jump
  ——————————————————————————————————————————————*/

  beginJump: function () {
    if (this.isOnObject || this.data.enableDoubleJump && this.numJumps === 1) {
      this.velocity = 15;
      this.numJumps++;
      if (this.data.soundJump) {
        this.el.querySelector(this.data.soundJump).emit('fire');
      }
    }
  },

  /* Terrain detection
  ——————————————————————————————————————————————*/

  getTerrain: (function () {
    var terrainObjects = [],
        cached = false;

    return function () {
      // Cache terrain for performance.
      if (cached) {
        return terrainObjects;
      }

      if (this.data.debug) console.time('[jump-ability] getTerrain()');

      var terrainSelector = this.el.sceneEl.getAttribute('terrain'),
          terrainEls = this.el.sceneEl.querySelectorAll(terrainSelector),
          pending = terrainSelector.split(',').length - terrainEls.length;

      for (var i = 0, l = terrainEls.length; i < l; i++) {
        if (terrainEls[i].object3D) {
          terrainObjects.push(terrainEls[i].object3D);
        } else {
          pending++;
        }
      }

      if (this.data.debug) {
        console.timeEnd('[jump-ability] getTerrain()');
        console.info('[jump-ability] %d terrain geometries found.', terrainObjects.length);
        if (pending) {
          console.info('[jump-ability] awaiting %d more terrain geometries', pending);
        }
      }

      cached = !pending;
      return terrainObjects;
    };
  }())
};
