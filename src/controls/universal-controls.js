/**
 * Universal Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

const COMPONENT_SUFFIX = '-controls',
    MAX_DELTA = 0.2, // ms
    PI_2 = Math.PI / 2,
    EPS = 10e-6;

module.exports = AFRAME.registerComponent('universal-controls', {

  /*******************************************************************
   * Schema
   */

  dependencies: ['velocity', 'rotation'],

  schema: {
    enabled:              { default: true },
    movementEnabled:      { default: true },
    movementControls:     { default: ['gamepad', 'keyboard', 'touch', 'hmd'] },
    rotationEnabled:      { default: true },
    rotationControls:     { default: ['hmd', 'gamepad', 'mouse'] },
    movementEasing:       { default: 15 }, // m/s2
    movementEasingY:      { default: 0  }, // m/s2
    movementAcceleration: { default: 80 }, // m/s2
    rotationSensitivity:  { default: 0.05 }, // radians/frame, ish
    fly:                  { default: false },
    constrainToNavMesh:   { default: false },
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    var rotation = this.el.getAttribute('rotation');

    if (this.el.hasAttribute('look-controls') && this.data.rotationEnabled) {
      console.error('[universal-controls] The `universal-controls` component is a replacement '
        + 'for `look-controls`, and cannot be used in combination with it.');
    }

    this.velocityCtrl = null;
    this.rotationCtrl = null;

    // Movement
    this.velocity = new THREE.Vector3();

    // Rotation
    this.pitch = new THREE.Object3D();
    this.pitch.rotation.x = THREE.Math.degToRad(rotation.x);
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.rotation.y = THREE.Math.degToRad(rotation.y);
    this.yaw.add(this.pitch);
    this.heading = new THREE.Euler(0, 0, 0, 'YXZ');

    // Navigation
    this.navGroup = null;
    this.navNode = null;

    if (this.el.sceneEl.hasLoaded) {
      this.injectControls();
    } else {
      this.el.sceneEl.addEventListener('loaded', this.injectControls.bind(this));
    }
  },

  update: function () {
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

    for (let i = 0; i < data.rotationControls.length; i++) {
      name = data.rotationControls[i] + COMPONENT_SUFFIX;
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
      if (!dt) { return; }

      // Update rotation.
      if (this.data.rotationEnabled) this.updateRotation(dt);

      // Update velocity. If FPS is too low, reset.
      if (this.data.movementEnabled && dt / 1000 > MAX_DELTA) {
        this.velocity.set(0, 0, 0);
      } else {
        this.updateVelocity(dt);
      }

      if (this.data.constrainToNavMesh
          && (this.velocityCtrl||{}).isNavMeshConstrained !== false) {

        if (this.velocity.lengthSq() < EPS) return;

        // Camera will throw the height around a bit.
        let yOffset = 0;
        if (this.el.hasAttribute('camera')) {
          yOffset = this.el.getAttribute('camera').userHeight;
        }

        start.copy(this.el.getAttribute('position'));
        start.y -= yOffset;
        end
          .copy(this.velocity)
          .multiplyScalar(dt / 1000)
          .add(start);

        const nav = this.el.sceneEl.systems.nav;
        this.navGroup = this.navGroup || nav.getGroup(start);
        this.navNode = this.navNode || nav.getNode(start, this.navGroup);
        this.navNode = nav.clampStep(start, end, this.navGroup, this.navNode, clampedEnd);
        clampedEnd.y += yOffset;
        this.el.setAttribute('position', clampedEnd);
      } else if (AFRAME.components.velocity) {
        this.el.setAttribute('velocity', this.velocity);
      } else {
        const position = this.el.getAttribute('position') || {x: 0, y: 0, z: 0};
        this.el.setAttribute('position', {
          x: position.x + this.velocity.x * dt / 1000,
          y: position.y + this.velocity.y * dt / 1000,
          z: position.z + this.velocity.z * dt / 1000
        });
      }

    };
  }()),

  /*******************************************************************
   * Rotation
   */

  updateRotation: function (dt) {
    let control, dRotation;
    const data = this.data;

    for (var i = 0, l = data.rotationControls.length; i < l; i++) {
      control = this.el.components[data.rotationControls[i] + COMPONENT_SUFFIX];
      if (control && control.isRotationActive()) {
        this.rotationCtrl = control;
        if (control.getRotationDelta) {
          dRotation = control.getRotationDelta(dt);
          dRotation.multiplyScalar(data.rotationSensitivity);
          this.yaw.rotation.y -= dRotation.x;
          this.pitch.rotation.x -= dRotation.y;
          this.pitch.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitch.rotation.x));
          this.el.setAttribute('rotation', {
            x: THREE.Math.radToDeg(this.pitch.rotation.x),
            y: THREE.Math.radToDeg(this.yaw.rotation.y),
            z: 0
          });
        } else if (control.getRotation) {
          this.el.setAttribute('rotation', control.getRotation());
        } else {
          throw new Error('Incompatible rotation controls: %s', data.rotationControls[i]);
        }
        break;
      }
    }
  },

  /*******************************************************************
   * Movement
   */

  updateVelocity: function (dt) {
    let control, dVelocity;
    const velocity = this.velocity;
    const data = this.data;

    if (data.movementEnabled) {
      for (let i = 0, l = data.movementControls.length; i < l; i++) {
        control = this.el.components[data.movementControls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          if (control.getVelocityDelta) {
            dVelocity = control.getVelocityDelta(dt);
          } else if (control.getVelocity) {
            velocity.copy(control.getVelocity());
            return;
          } else if (control.getPositionDelta) {
            velocity.copy(control.getPositionDelta(dt).multiplyScalar(1000 / dt));
            return;
          } else {
            throw new Error('Incompatible movement controls: ', data.movementControls[i]);
          }
          break;
        }
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

      // Rotate to heading
      const rotation = this.el.getAttribute('rotation');
      if (rotation) {
        this.heading.set(
          data.fly ? THREE.Math.degToRad(rotation.x) : 0,
          THREE.Math.degToRad(rotation.y),
          0
        );
        dVelocity.applyEuler(this.heading);
      }

      velocity.add(dVelocity);
    }
  }
});
