/**
 * Universal Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

var COMPONENT_SUFFIX = '-controls',
    MAX_DELTA = 0.2, // ms
    PI_2 = Math.PI / 2;

module.exports = {

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
    movementSpeed:        { default: 5 }, // m/s
    movementEasing:       { default: 15 }, // m/s2
    movementEasingY:      { default: 0  }, // m/s2
    movementAcceleration: { default: 80 }, // m/s2
    rotationSensitivity:  { default: 0.05 }, // radians/frame, ish
    fly:                  { default: false },
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
    var i, name,
        data = this.data;

    for (i = 0; i < data.movementControls.length; i++) {
      name = data.movementControls[i] + COMPONENT_SUFFIX;
      if (!this.el.components[name]) {
        this.el.setAttribute(name, '');
      }
    }

    for (i = 0; i < data.rotationControls.length; i++) {
      name = data.rotationControls[i] + COMPONENT_SUFFIX;
      if (!this.el.components[name]) {
        this.el.setAttribute(name, '');
      }
    }
  },

  /*******************************************************************
   * Tick
   */

  tick: function (t, dt) {
    if (!dt) { return; }

    // Update rotation.
    if (this.data.rotationEnabled) this.updateRotation(dt);

    // Update velocity. If FPS is too low, reset.
    if (this.data.movementEnabled && dt / 1000 > MAX_DELTA) {
      this.velocity.set(0, 0, 0);
      this.el.setAttribute('velocity', this.velocity);
    } else {
      this.updateVelocity(dt);
    }
  },

  /*******************************************************************
   * Rotation
   */

  updateRotation: function (dt) {
    var control, dRotation,
        data = this.data;

    for (var i = 0, l = data.rotationControls.length; i < l; i++) {
      control = this.el.components[data.rotationControls[i] + COMPONENT_SUFFIX];
      if (control && control.isRotationActive()) {
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
    var control, dVelocity,
        velocity = this.velocity,
        data = this.data;

    if (data.movementEnabled) {
      for (var i = 0, l = data.movementControls.length; i < l; i++) {
        control = this.el.components[data.movementControls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          if (control.getVelocityDelta) {
            dVelocity = control.getVelocityDelta(dt);
          } else if (control.getVelocity) {
            this.el.setAttribute('velocity', control.getVelocity());
            return;
          } else if (control.getPositionDelta) {
            velocity.copy(control.getPositionDelta(dt).multiplyScalar(1000 / dt));
            this.el.setAttribute('velocity', velocity);
            return;
          } else {
            throw new Error('Incompatible movement controls: ', data.movementControls[i]);
          }
          break;
        }
      }
    }

    velocity.copy(this.el.getAttribute('velocity'));
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
      var rotation = this.el.getAttribute('rotation');
      if (rotation) {
        this.heading.set(
          data.fly ? THREE.Math.degToRad(rotation.x) : 0,
          THREE.Math.degToRad(rotation.y),
          0
        );
        dVelocity.applyEuler(this.heading);
      }

      velocity.add(dVelocity);

      // TODO - Several issues here:
      // (1) Interferes w/ gravity.
      // (2) Interferes w/ jumping.
      // (3) Likely to interfere w/ relative position to moving platform.
      // if (velocity.length() > data.movementSpeed) {
      //   velocity.setLength(data.movementSpeed);
      // }
    }

    this.el.setAttribute('velocity', velocity);
  }
};
