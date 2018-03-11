/**
 * Universal Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

const COMPONENT_SUFFIX = '-controls',
    MAX_DELTA = 0.2, // ms
    EPS = 10e-6;

module.exports = AFRAME.registerComponent('universal-controls', {

  /*******************************************************************
   * Schema
   */

  dependencies: ['velocity', 'rotation'],

  schema: {
    enabled:              { default: true },
    movementEnabled:      { default: true },
    movementControls:     { default: ['gamepad', 'keyboard', 'touch'] },
    movementEasing:       { default: 15 }, // m/s2
    movementEasingY:      { default: 0  }, // m/s2
    movementAcceleration: { default: 80 }, // m/s2
    fly:                  { default: false },
    constrainToNavMesh:   { default: false },
    headingEl:            { default: '[camera]', type: 'selector' }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    const el = this.el;

    this.velocityCtrl = null;

    this.velocity = new THREE.Vector3();
    this.heading = new THREE.Quaternion();

    // Navigation
    this.navGroup = null;
    this.navNode = null;

    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    } else {
      el.sceneEl.addEventListener('loaded', this.injectControls.bind(this));
    }
  },

  update: function (prevData) {
    const data = this.data;
    if (this.el.sceneEl.hasLoaded) {
      this.injectControls();
    }
  },

  injectControls: function () {
    const data = this.data;
    var name;

    for (let i = 0; i < data.movementControls.length; i++) {
      name = data.movementControls[i] + COMPONENT_SUFFIX;
      if (!this.el.components[name]) {
        this.el.setAttribute(name, '');
      }
    }
  },

  /*******************************************************************
   * Tick
   */

  tick: (function () {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    const clampedEnd = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      const el = this.el;
      const data = this.data;

      if (!data.movementEnabled) return;

      this.updateVelocityCtrl();
      const velocityCtrl = this.velocityCtrl;
      const velocity = this.velocity;

      if (!velocityCtrl) return;

      // Update velocity. If FPS is too low, reset.
      if (dt / 1000 > MAX_DELTA) {
        velocity.set(0, 0, 0);
      } else {
        this.updateVelocity(dt);
      }

      if (data.constrainToNavMesh
          && velocityCtrl.isNavMeshConstrained !== false) {

        if (velocity.lengthSq() < EPS) return;

        start.copy(el.object3D.position);
        end
          .copy(velocity)
          .multiplyScalar(dt / 1000)
          .add(start);

        const nav = el.sceneEl.systems.nav;
        this.navGroup = this.navGroup || nav.getGroup(start);
        this.navNode = this.navNode || nav.getNode(start, this.navGroup);
        this.navNode = nav.clampStep(start, end, this.navGroup, this.navNode, clampedEnd);
        el.object3D.position.copy(clampedEnd);
        // el.setAttribute('position', clampedEnd);
      } else if (AFRAME.components.velocity) {
        el.setAttribute('velocity', velocity);
      } else {
        el.object3D.position.add(
          velocity.x * dt / 1000,
          velocity.y * dt / 1000,
          velocity.z * dt / 1000
        );
      }

    };
  }()),

  /*******************************************************************
   * Movement
   */

  updateVelocityCtrl: function () {
    const data = this.data;
    if (data.movementEnabled) {
      for (let i = 0, l = data.movementControls.length; i < l; i++) {
        const control = this.el.components[data.movementControls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          return;
        }
      }
    }
  },

  updateVelocity: (function () {
    // var matrix = new THREE.Matrix4();
    // var matrix2 = new THREE.Matrix4();
    // var position = new THREE.Vector3();
    // var quaternion = new THREE.Quaternion();
    // var scale = new THREE.Vector3();

    return function (dt) {
      let dVelocity;
      const el = this.el;
      const control = this.velocityCtrl;
      const velocity = this.velocity;
      const data = this.data;

      if (control) {
        if (control.getVelocityDelta) {
          dVelocity = control.getVelocityDelta(dt);
        } else if (control.getVelocity) {
          velocity.copy(control.getVelocity());
          return;
        } else if (control.getPositionDelta) {
          velocity.copy(control.getPositionDelta(dt).multiplyScalar(1000 / dt));
          return;
        } else {
          throw new Error('Incompatible movement controls: ', control);
        }
      }

      if (AFRAME.components.velocity && !data.constrainToNavMesh) velocity.copy(this.el.getAttribute('velocity'));
      velocity.x -= velocity.x * data.movementEasing * dt / 1000;
      velocity.y -= velocity.y * data.movementEasingY * dt / 1000;
      velocity.z -= velocity.z * data.movementEasing * dt / 1000;

      if (dVelocity && data.movementEnabled) {
        // Set acceleration
        if (dVelocity.length() > 1) {
          dVelocity.setLength(this.data.movementAcceleration * dt / 1000);
        } else {
          dVelocity.multiplyScalar(this.data.movementAcceleration * dt / 1000);
        }

        // TODO: Handle rotated rig.
        // const headingEl = data.headingEl;
        // matrix.copy(headingEl.object3D.matrixWorld);
        // matrix2.getInverse(el.object3D.matrixWorld);
        // matrix.multiply(matrix2);
        // matrix.decompose(position, quaternion, scale);
        // dVelocity.applyQuaternion(quaternion);

        // Rotate to heading
        dVelocity.applyQuaternion(data.headingEl.object3D.quaternion);

        if (!data.fly) dVelocity.y = 0;

        velocity.add(dVelocity);
      }
    };

  }())
});
