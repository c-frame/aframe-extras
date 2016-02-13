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

  update: function () {
    this.tick();
  },

  tick: function (t, tDelta) {
    var terrain = this.getTerrain();

    if (!terrain.length) {
      if (this.data.debug) console.warn('[jump-ability] Cannot jump - no terrain found.');
      return;
    }

    this.position.copy(this.el.getAttribute('position'));
    this.raycaster.ray.origin.copy(this.position);
    var intersections = this.raycaster.intersectObjects(terrain);
    this.isOnObject = intersections.length > 0;

    if (this.isOnObject && this.velocity <= 0) {
      this.velocity = 0;
      this.numJumps = 0;
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
    }
  },

  /* Terrain detection
  ——————————————————————————————————————————————*/

  getTerrain: (function () {
    var terrainObjects = [];

    return function () {
      // Cache terrain for performance.
      if (terrainObjects.length) {
        return terrainObjects;
      }

      if (this.data.debug) console.time('[jump-ability] getTerrain()');

      var terrainSelector = this.el.sceneEl.getAttribute('terrain'),
          terrainGroups = this.el.sceneEl.querySelectorAll(terrainSelector);

      // Select all groups indicated in a-scene[terrain].
      for (var i1 = 0, l1 = terrainGroups.length; i1 < l1; i1++) {
        var terrainEls = terrainGroups[i1].querySelectorAll('[geometry]');
        // Select any elements in these groups with geometry.
        for (var i2 = 0, l2 = terrainEls.length; i2 < l2; i2++) {
          if (terrainEls[i2].object3D) {
            // Select all meshes from each object.
            for (var i3 = 0, l3 = terrainEls[i2].object3D.children.length; i3 < l3; i3++) {
              terrainObjects.push(terrainEls[i2].object3D.children[i3]);
            }
          }
        }
      }

      if (this.data.debug) {
        console.timeEnd('[jump-ability] getTerrain()');
        console.info('[jump-ability] %d terrain geometries found.', terrainObjects.length);
      }

      return terrainObjects;
    };
  }())
};
