/**
 * Universal Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

var COMPONENT_SUFFIX = '-controls',
    MAX_DELTA = 0.2; // ms

module.exports = {

  /*******************************************************************
   * Schema
   */

  dependencies: ['velocity'],

  schema: {
    enabled:              { default: true },
    movementControls:     { default: ['gamepad', 'keyboard', 'touch'] },
    rotationControls:     { default: ['hmd', 'pointerlock', 'gamepad', 'mousedrag'] },
    movementSpeed:        { default: 5 }, // m/s
    movementEasing:       { default: 15 }, // m/s2
    movementAcceleration: { default: 80 }, // m/s2
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    this.velocity = new THREE.Vector3();

    if (this.el.sceneEl.addBehavior) {
      this.el.sceneEl.addBehavior(this);
    }
  },

  update: (function () {
    var tPrev = Date.now();
    return function () {
      var t = Date.now();
      this.tick(t, t - tPrev);
      tPrev = t;
    };
  }()),

  remove: function () {},

  /*******************************************************************
   * Tick
   */

  tick: function (t, dt) {
    // Update rotation.
    this.updateRotation(dt);

    // Update velocity.
    if (dt / 1000 > MAX_DELTA) {
      // If FPS drops too low, reset the velocity.
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
    var control, rotationControls,
        rotation, dRotation,
        data = this.data;

    rotationControls = data.rotationControls;
    for (var i = 0, l = data.rotationControls.length; i < l; i++) {
      control = this.el.components[data.rotationControls[i] + COMPONENT_SUFFIX];
      if (control && control.isRotationActive()) {
        if (control.getRotationDelta) {
          rotation = this.el.getAttribute('rotation');
          dRotation = control.getRotationDelta(dt);
          this.el.setAttribute('rotation', {
            x: rotation.x + dRotation.x,
            y: rotation.y + dRotation.y,
            z: rotation.z + dRotation.z
          });
        } else if (control.getRotation) {
          this.el.setAttribute('rotation', control.getRotation());
        } else {
          console.error('Invalid rotation controls: %s', data.rotationControls[i]);
        }
        break;
      }
    }
  },

  /*******************************************************************
   * Movement
   */

  updateVelocity: function (dt) {
    var control, movementControls,
        velocity, dVelocity,
        data = this.data;

    movementControls = data.movementControls;
    for (var i = 0, l = data.movementControls.length; i < l; i++) {
      control = this.el.components[data.movementControls[i] + COMPONENT_SUFFIX];
      if (control && control.isMovementActive()) {
        if (control.getMovementDelta) {
          dVelocity = control.getMovementDelta(dt);
        } else if (control.getVelocity) {
          throw new Error('getVelocity() not currently supported, use getMovementDelta()');
        } else {
          throw new Error('Incompatible movement controls: ', data.movementControls[i]);
        }
        break;
      }
    }

    velocity = this.velocity;
    velocity.copy(this.el.getAttribute('velocity'));
    velocity.x -= velocity.x * data.movementEasing * dt / 1000;
    velocity.z -= velocity.z * data.movementEasing * dt / 1000;

    if (dVelocity) {
      if (dVelocity.length() > 1) {
        dVelocity.setLength(this.data.movementAcceleration * dt / 1000);
      } else {
        dVelocity.multiplyScalar(this.data.movementAcceleration * dt / 1000);
      }

      velocity.set(
        velocity.x + dVelocity.x,
        velocity.y + dVelocity.y,
        velocity.z + dVelocity.z
      );

      if (velocity.length() > data.movementSpeed) {
        velocity.setLength(data.movementSpeed);
      }
    }

    this.el.setAttribute('velocity', velocity);
  }
};
