/**
 * Movement Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

const COMPONENT_SUFFIX = '-controls';
const MAX_DELTA = 0.2; // ms
const EPS = 10e-6;
const MOVED = 'moved';

AFRAME.registerComponent('movement-controls', {

  /*******************************************************************
   * Schema
   */

  dependencies: ['rotation'],

  schema: {
    enabled:            { default: true },
    controls:           { default: ['gamepad', 'trackpad', 'keyboard', 'touch'] },
    speed:              { default: 0.3, min: 0 },
    fly:                { default: false },
    constrainToNavMesh: { default: false },
    camera:             { default: '[movement-controls] [camera]', type: 'selector' }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    const el = this.el;
    if (!this.data.camera) {
      this.data.camera = el.querySelector('[camera]');
    }
    this.velocityCtrl = null;

    this.velocity = new THREE.Vector3();
    this.heading = new THREE.Quaternion();
    this.eventDetail = {};

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
    const el = this.el;
    const data = this.data;
    const nav = el.sceneEl.systems.nav;
    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    }
    if (nav && data.constrainToNavMesh !== prevData.constrainToNavMesh) {
      data.constrainToNavMesh
        ? nav.addAgent(this)
        : nav.removeAgent(this);
    }
    if (data.enabled !== prevData.enabled) {
      // Propagate the enabled change to all controls
      for (let i = 0; i < data.controls.length; i++) {
        const name = data.controls[i] + COMPONENT_SUFFIX;
        this.el.setAttribute(name, { enabled: this.data.enabled });
      }
    }
  },

  injectControls: function () {
    const data = this.data;

    for (let i = 0; i < data.controls.length; i++) {
      const name = data.controls[i] + COMPONENT_SUFFIX;
      this.el.setAttribute(name, { enabled: this.data.enabled });
    }
  },

  updateNavLocation: function () {
    this.navGroup = null;
    this.navNode = null;
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

      if (!data.enabled) return;

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
        this.navGroup = this.navGroup === null ? nav.getGroup(start) : this.navGroup;
        this.navNode = this.navNode || nav.getNode(start, this.navGroup);
        this.navNode = nav.clampStep(start, end, this.navGroup, this.navNode, clampedEnd);
        el.object3D.position.copy(clampedEnd);
      } else if (el.hasAttribute('velocity')) {
        el.setAttribute('velocity', velocity);
      } else {
        el.object3D.position.x += velocity.x * dt / 1000;
        el.object3D.position.y += velocity.y * dt / 1000;
        el.object3D.position.z += velocity.z * dt / 1000;
      }

    };
  }()),

  /*******************************************************************
   * Movement
   */

  updateVelocityCtrl: function () {
    const data = this.data;
    if (data.enabled) {
      for (let i = 0, l = data.controls.length; i < l; i++) {
        const control = this.el.components[data.controls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          return;
        }
      }
      this.velocityCtrl = null;
    }
  },

  updateVelocity: (function () {
    const vector2 = new THREE.Vector2();
    const quaternion = new THREE.Quaternion();

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

      if (el.hasAttribute('velocity') && !data.constrainToNavMesh) {
        velocity.copy(this.el.getAttribute('velocity'));
      }

      if (dVelocity && data.enabled) {
        const cameraEl = data.camera;

        // Rotate to heading
        quaternion.copy(cameraEl.object3D.quaternion);
        quaternion.premultiply(el.object3D.quaternion);
        dVelocity.applyQuaternion(quaternion);

        const factor = dVelocity.length();
        if (data.fly) {
          velocity.copy(dVelocity);
          velocity.multiplyScalar(this.data.speed * 16.66667);
        } else {
          vector2.set(dVelocity.x, dVelocity.z);
          vector2.setLength(factor * this.data.speed * 16.66667);
          velocity.x = vector2.x;
          velocity.y = 0;
          velocity.z = vector2.y;
        }
        if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {
          this.eventDetail.velocity = velocity;
          this.el.emit(MOVED, this.eventDetail);
        }
      }
    };

  }())
});
