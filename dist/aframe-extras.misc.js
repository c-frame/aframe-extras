(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./src/misc');

},{"./src/misc":5}],2:[function(require,module,exports){
'use strict';

module.exports = AFRAME.registerComponent('checkpoint', {
  schema: {
    offset: { default: { x: 0, y: 0, z: 0 }, type: 'vec3' }
  },

  init: function init() {
    this.active = false;
    this.targetEl = null;
    this.fire = this.fire.bind(this);
    this.offset = new THREE.Vector3();
  },

  update: function update() {
    this.offset.copy(this.data.offset);
  },

  play: function play() {
    this.el.addEventListener('click', this.fire);
  },
  pause: function pause() {
    this.el.removeEventListener('click', this.fire);
  },
  remove: function remove() {
    this.pause();
  },

  fire: function fire() {
    var targetEl = this.el.sceneEl.querySelector('[checkpoint-controls]');
    if (!targetEl) {
      throw new Error('No `checkpoint-controls` component found.');
    }
    targetEl.components['checkpoint-controls'].setCheckpoint(this.el);
  },

  getOffset: function getOffset() {
    return this.offset.copy(this.data.offset);
  }
});

},{}],3:[function(require,module,exports){
'use strict';

/**
 * @param  {Array<THREE.Material>|THREE.Material} material
 * @return {Array<THREE.Material>}
 */

function ensureMaterialArray(material) {
  if (!material) {
    return [];
  } else if (Array.isArray(material)) {
    return material;
  } else if (material.materials) {
    return material.materials;
  } else {
    return [material];
  }
}

/**
 * @param  {THREE.Object3D} mesh
 * @param  {Array<string>} materialNames
 * @param  {THREE.Texture} envMap
 * @param  {number} reflectivity  [description]
 */
function applyEnvMap(mesh, materialNames, envMap, reflectivity) {
  if (!mesh) return;

  materialNames = materialNames || [];

  mesh.traverse(function (node) {

    if (!node.isMesh) return;

    var meshMaterials = ensureMaterialArray(node.material);

    meshMaterials.forEach(function (material) {

      if (material && !('envMap' in material)) return;
      if (materialNames.length && materialNames.indexOf(material.name) === -1) return;

      material.envMap = envMap;
      material.reflectivity = reflectivity;
      material.needsUpdate = true;
    });
  });
}

/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 */
module.exports = AFRAME.registerComponent('cube-env-map', {
  multiple: true,

  schema: {
    path: { default: '' },
    extension: { default: 'jpg', oneOf: ['jpg', 'png'] },
    format: { default: 'RGBFormat', oneOf: ['RGBFormat', 'RGBAFormat'] },
    enableBackground: { default: false },
    reflectivity: { default: 1, min: 0, max: 1 },
    materials: { default: [] }
  },

  init: function init() {
    var _this = this;

    var data = this.data;

    this.texture = new THREE.CubeTextureLoader().load([data.path + 'posx.' + data.extension, data.path + 'negx.' + data.extension, data.path + 'posy.' + data.extension, data.path + 'negy.' + data.extension, data.path + 'posz.' + data.extension, data.path + 'negz.' + data.extension]);
    this.texture.format = THREE[data.format];

    this.object3dsetHandler = function () {
      var mesh = _this.el.getObject3D('mesh');
      var data = _this.data;
      applyEnvMap(mesh, data.materials, _this.texture, data.reflectivity);
    };
    this.el.addEventListener('object3dset', this.object3dsetHandler);
  },

  update: function update(oldData) {
    var data = this.data;
    var mesh = this.el.getObject3D('mesh');

    var addedMaterialNames = [];
    var removedMaterialNames = [];

    if (data.materials.length) {
      if (oldData.materials) {
        addedMaterialNames = data.materials.filter(function (name) {
          return !oldData.materials.includes(name);
        });
        removedMaterialNames = oldData.materials.filter(function (name) {
          return !data.materials.includes(name);
        });
      } else {
        addedMaterialNames = data.materials;
      }
    }
    if (addedMaterialNames.length) {
      applyEnvMap(mesh, addedMaterialNames, this.texture, data.reflectivity);
    }
    if (removedMaterialNames.length) {
      applyEnvMap(mesh, removedMaterialNames, null, 1);
    }

    if (oldData.materials && data.reflectivity !== oldData.reflectivity) {
      var maintainedMaterialNames = data.materials.filter(function (name) {
        return oldData.materials.includes(name);
      });
      if (maintainedMaterialNames.length) {
        applyEnvMap(mesh, maintainedMaterialNames, this.texture, data.reflectivity);
      }
    }

    if (this.data.enableBackground && !oldData.enableBackground) {
      this.setBackground(this.texture);
    } else if (!this.data.enableBackground && oldData.enableBackground) {
      this.setBackground(null);
    }
  },

  remove: function remove() {
    this.el.removeEventListener('object3dset', this.object3dsetHandler);
    var mesh = this.el.getObject3D('mesh');
    var data = this.data;

    applyEnvMap(mesh, data.materials, null, 1);
    if (data.enableBackground) this.setBackground(null);
  },

  setBackground: function setBackground(texture) {
    this.el.sceneEl.object3D.background = texture;
  }
});

},{}],4:[function(require,module,exports){
'use strict';

/* global CANNON */

/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Handles events coming from the hand-controls.
 * Determines if the entity is grabbed or released.
 * Updates its position to move along the controller.
 */

module.exports = AFRAME.registerComponent('grab', {
  init: function init() {
    this.system = this.el.sceneEl.systems.physics;

    this.GRABBED_STATE = 'grabbed';

    this.grabbing = false;
    this.hitEl = /** @type {AFRAME.Element}    */null;
    this.physics = /** @type {AFRAME.System}     */this.el.sceneEl.systems.physics;
    this.constraint = /** @type {CANNON.Constraint} */null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);
  },

  play: function play() {
    var el = this.el;
    el.addEventListener('hit', this.onHit);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function pause() {
    var el = this.el;
    el.removeEventListener('hit', this.onHit);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function onGripClose() {
    this.grabbing = true;
  },

  onGripOpen: function onGripOpen() {
    var hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) {
      return;
    }
    hitEl.removeState(this.GRABBED_STATE);
    this.hitEl = undefined;
    this.system.removeConstraint(this.constraint);
    this.constraint = null;
  },

  onHit: function onHit(evt) {
    var hitEl = evt.detail.el;
    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (!hitEl || hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) {
      return;
    }
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;
    this.constraint = new CANNON.LockConstraint(this.el.body, hitEl.body);
    this.system.addConstraint(this.constraint);
  }
});

},{}],5:[function(require,module,exports){
'use strict';

require('./checkpoint');
require('./cube-env-map');
require('./grab');
require('./jump-ability');
require('./kinematic-body');
require('./mesh-smooth');
require('./normal-material');
require('./sphere-collider');

},{"./checkpoint":2,"./cube-env-map":3,"./grab":4,"./jump-ability":6,"./kinematic-body":7,"./mesh-smooth":8,"./normal-material":9,"./sphere-collider":10}],6:[function(require,module,exports){
'use strict';

var ACCEL_G = -9.8,

// m/s^2
EASING = -15; // m/s^2

/**
 * Jump ability.
 */
module.exports = AFRAME.registerComponent('jump-ability', {
  dependencies: ['velocity'],

  /* Schema
  ——————————————————————————————————————————————*/

  schema: {
    on: { default: 'keydown:Space gamepadbuttondown:0' },
    playerHeight: { default: 1.764 },
    maxJumps: { default: 1 },
    distance: { default: 5 },
    debug: { default: false }
  },

  init: function init() {
    this.velocity = 0;
    this.numJumps = 0;

    var beginJump = this.beginJump.bind(this),
        events = this.data.on.split(' ');
    this.bindings = {};
    for (var i = 0; i < events.length; i++) {
      this.bindings[events[i]] = beginJump;
      this.el.addEventListener(events[i], beginJump);
    }
    this.bindings.collide = this.onCollide.bind(this);
    this.el.addEventListener('collide', this.bindings.collide);
  },

  remove: function remove() {
    for (var event in this.bindings) {
      if (this.bindings.hasOwnProperty(event)) {
        this.el.removeEventListener(event, this.bindings[event]);
        delete this.bindings[event];
      }
    }
    this.el.removeEventListener('collide', this.bindings.collide);
    delete this.bindings.collide;
  },

  beginJump: function beginJump() {
    if (this.numJumps < this.data.maxJumps) {
      var data = this.data,
          initialVelocity = Math.sqrt(-2 * data.distance * (ACCEL_G + EASING)),
          v = this.el.getAttribute('velocity');
      this.el.setAttribute('velocity', { x: v.x, y: initialVelocity, z: v.z });
      this.numJumps++;
      this.el.emit('jumpstart');
    }
  },

  onCollide: function onCollide() {
    if (this.numJumps > 0) this.el.emit('jumpend');
    this.numJumps = 0;
  }
});

},{}],7:[function(require,module,exports){
'use strict';

/* global CANNON */

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

var EPS = 0.000001;

module.exports = AFRAME.registerComponent('kinematic-body', {
  dependencies: ['velocity'],

  /*******************************************************************
   * Schema
   */

  schema: {
    mass: { default: 5 },
    radius: { default: 1.3 },
    linearDamping: { default: 0.05 },
    enableSlopes: { default: true },
    enableJumps: { default: false }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function init() {
    this.system = this.el.sceneEl.systems.physics;
    this.system.addComponent(this);

    var el = this.el,
        data = this.data,
        position = new CANNON.Vec3().copy(el.object3D.getWorldPosition(new THREE.Vector3()));

    this.body = new CANNON.Body({
      material: this.system.getMaterial('staticMaterial'),
      position: position,
      mass: data.mass,
      linearDamping: data.linearDamping,
      fixedRotation: true
    });
    this.body.addShape(new CANNON.Sphere(data.radius), new CANNON.Vec3(0, data.radius, 0));

    this.body.el = this.el;
    this.el.body = this.body;
    this.system.addBody(this.body);

    if (el.hasAttribute('wasd-controls')) {
      console.warn('[kinematic-body] Not compatible with wasd-controls, use movement-controls.');
    }
  },

  remove: function remove() {
    this.system.removeBody(this.body);
    this.system.removeComponent(this);
    delete this.el.body;
  },

  /*******************************************************************
   * Update
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
  beforeStep: function beforeStep(t, dt) {
    if (!dt) return;

    var el = this.el;
    var data = this.data;
    var body = this.body;

    if (!data.enableJumps) body.velocity.set(0, 0, 0);
    body.position.copy(el.getAttribute('position'));
  },

  step: function () {
    var velocity = new THREE.Vector3(),
        normalizedVelocity = new THREE.Vector3(),
        currentSurfaceNormal = new THREE.Vector3(),
        groundNormal = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      var body = this.body,
          data = this.data,
          didCollide = false,
          height = void 0,
          groundHeight = -Infinity,
          groundBody = void 0,
          contacts = this.system.getContacts();

      dt = Math.min(dt, this.system.data.maxInterval * 1000);

      groundNormal.set(0, 0, 0);
      velocity.copy(this.el.getAttribute('velocity'));
      body.velocity.copy(velocity);

      for (var i = 0, contact; contact = contacts[i]; i++) {
        // 1. Find any collisions involving this element. Get the contact
        // normal, and make sure it's oriented _out_ of the other object and
        // enabled (body.collisionReponse is true for both bodies)
        if (!contact.enabled) {
          continue;
        }
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
          velocity.projectOnPlane(currentSurfaceNormal);
        } else if (currentSurfaceNormal.y > 0.5) {
          // 3. If in contact with something roughly horizontal (+/- 45º) then
          // consider that the current ground. Only the highest qualifying
          // ground is retained.
          height = body.id === contact.bi.id ? Math.abs(contact.rj.y + contact.bj.position.y) : Math.abs(contact.ri.y + contact.bi.position.y);
          if (height > groundHeight) {
            groundHeight = height;
            groundNormal.copy(currentSurfaceNormal);
            groundBody = body.id === contact.bi.id ? contact.bj : contact.bi;
          }
        }
      }

      normalizedVelocity.copy(velocity).normalize();
      if (groundBody && (!data.enableJumps || normalizedVelocity.y < 0.5)) {
        if (!data.enableSlopes) {
          groundNormal.set(0, 1, 0);
        } else if (groundNormal.y < 1 - EPS) {
          groundNormal.copy(this.raycastToGround(groundBody, groundNormal));
        }

        // 4. Project trajectory onto the top-most ground object, unless
        // trajectory is > 45º.
        velocity.projectOnPlane(groundNormal);
      } else if (this.system.driver.world) {
        // 5. If not in contact with anything horizontal, apply world gravity.
        // TODO - Why is the 4x scalar necessary.
        // NOTE: Does not work if physics runs on a worker.
        velocity.add(this.system.driver.world.gravity.scale(dt * 4.0 / 1000));
      }

      body.velocity.copy(velocity);
      this.el.setAttribute('velocity', body.velocity);
      this.el.setAttribute('position', body.position);
    };
  }(),

  /**
   * When walking on complex surfaces (trimeshes, borders between two shapes),
   * the collision normals returned for the player sphere can be very
   * inconsistent. To address this, raycast straight down, find the collision
   * normal, and return whichever normal is more vertical.
   * @param  {CANNON.Body} groundBody
   * @param  {CANNON.Vec3} groundNormal
   * @return {CANNON.Vec3}
   */
  raycastToGround: function raycastToGround(groundBody, groundNormal) {
    var ray = void 0,
        hitNormal = void 0,
        vFrom = this.body.position,
        vTo = this.body.position.clone();

    ray = new CANNON.Ray(vFrom, vTo);
    ray._updateDirection(); // TODO - Report bug.
    ray.intersectBody(groundBody);

    if (!ray.hasHit) return groundNormal;

    // Compare ABS, in case we're projecting against the inside of the face.
    hitNormal = ray.result.hitNormalWorld;
    return Math.abs(hitNormal.y) > Math.abs(groundNormal.y) ? hitNormal : groundNormal;
  }
});

},{}],8:[function(require,module,exports){
'use strict';

/**
 * Apply this component to models that looks "blocky", to have Three.js compute
 * vertex normals on the fly for a "smoother" look.
 */

module.exports = AFRAME.registerComponent('mesh-smooth', {
  init: function init() {
    this.el.addEventListener('model-loaded', function (e) {
      e.detail.model.traverse(function (node) {
        if (node.isMesh) node.geometry.computeVertexNormals();
      });
    });
  }
});

},{}],9:[function(require,module,exports){
'use strict';

/**
 * Recursively applies a MeshNormalMaterial to the entity, such that
 * face colors are determined by their orientation. Helpful for
 * debugging geometry
 */

module.exports = AFRAME.registerComponent('normal-material', {
  init: function init() {
    this.material = new THREE.MeshNormalMaterial({ flatShading: true });
    this.applyMaterial = this.applyMaterial.bind(this);
    this.el.addEventListener('object3dset', this.applyMaterial);
  },

  remove: function remove() {
    this.el.removeEventListener('object3dset', this.applyMaterial);
  },

  applyMaterial: function applyMaterial() {
    var _this = this;

    this.el.object3D.traverse(function (node) {
      if (node.isMesh) node.material = _this.material;
    });
  }
});

},{}],10:[function(require,module,exports){
'use strict';

/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Implement bounding sphere collision detection for entities with a mesh.
 * Sets the specified state on the intersected entities.
 *
 * @property {string} objects - Selector of the entities to test for collision.
 * @property {string} state - State to set on collided entities.
 *
 */

module.exports = AFRAME.registerComponent('sphere-collider', {
  schema: {
    objects: { default: '' },
    state: { default: 'collided' },
    radius: { default: 0.05 },
    watch: { default: true }
  },

  init: function init() {
    /** @type {MutationObserver} */
    this.observer = null;
    /** @type {Array<Element>} Elements to watch for collisions. */
    this.els = [];
    /** @type {Array<Element>} Elements currently in collision state. */
    this.collisions = [];

    this.handleHit = this.handleHit.bind(this);
    this.handleHitEnd = this.handleHitEnd.bind(this);
  },

  remove: function remove() {
    this.pause();
  },

  play: function play() {
    var sceneEl = this.el.sceneEl;

    if (this.data.watch) {
      this.observer = new MutationObserver(this.update.bind(this, null));
      this.observer.observe(sceneEl, { childList: true, subtree: true });
    }
  },

  pause: function pause() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  /**
   * Update list of entities to test for collision.
   */
  update: function update() {
    var data = this.data;
    var objectEls = void 0;

    // Push entities into list of els to intersect.
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
    } else {
      // If objects not defined, intersect with everything.
      objectEls = this.el.sceneEl.children;
    }
    // Convert from NodeList to Array
    this.els = Array.prototype.slice.call(objectEls);
  },

  tick: function () {
    var position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3(),
        colliderScale = new THREE.Vector3(),
        size = new THREE.Vector3(),
        box = new THREE.Box3(),
        distanceMap = new Map();
    return function () {
      var el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh'),
          collisions = [];
      var colliderRadius = void 0;

      if (!mesh) {
        return;
      }

      distanceMap.clear();
      el.object3D.getWorldPosition(position);
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // Update collision list.
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions.sort(function (a, b) {
        return distanceMap.get(a) > distanceMap.get(b) ? 1 : -1;
      }).forEach(this.handleHit);

      // Remove collision state from current element.
      if (collisions.length === 0) {
        el.emit('hit', { el: null });
      }

      // Remove collision state from other elements.
      this.collisions.filter(function (el) {
        return !distanceMap.has(el);
      }).forEach(this.handleHitEnd);

      // Store new collisions
      this.collisions = collisions;

      // Bounding sphere collision detection
      function intersect(el) {
        var radius = void 0,
            mesh = void 0,
            distance = void 0,
            extent = void 0;

        if (!el.isEntity) {
          return;
        }

        mesh = el.getObject3D('mesh');

        if (!mesh) {
          return;
        }

        box.setFromObject(mesh).getSize(size);
        extent = Math.max(size.x, size.y, size.z) / 2;
        radius = Math.sqrt(2 * extent * extent);
        box.getCenter(meshPosition);

        if (!radius) {
          return;
        }

        distance = position.distanceTo(meshPosition);
        if (distance < radius + colliderRadius) {
          collisions.push(el);
          distanceMap.set(el, distance);
        }
      }
      // use max of scale factors to maintain bounding sphere collision
      function scaleFactor(scaleVec) {
        return Math.max.apply(null, scaleVec.toArray());
      }
    };
  }(),

  handleHit: function handleHit(targetEl) {
    targetEl.emit('hit');
    targetEl.addState(this.data.state);
    this.el.emit('hit', { el: targetEl });
  },
  handleHitEnd: function handleHitEnd(targetEl) {
    targetEl.emit('hitend');
    targetEl.removeState(this.data.state);
    this.el.emit('hitend', { el: targetEl });
  }
});

},{}]},{},[1]);
