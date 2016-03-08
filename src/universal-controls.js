// Ordered by precedence.
var DEFAULT_MOVEMENT_COMPONENTS = [
      'gamepad-controls', 'keyboard-controls', 'touch-movement'
    ],
    DEFAULT_ROTATION_COMPONENTS = [
      'hmd-rotation', 'pointerlock-rotation', 'gamepad-controls', 'mousedrag-rotation'
    ];

var MAX_DELTA = 0.2;

module.exports = {
  schema: {
    enabled:              { default: true },
    movementControls:     { default: DEFAULT_MOVEMENT_COMPONENTS },
    rotationControls:     { default: DEFAULT_ROTATION_COMPONENTS },
    movementSpeed:        { default: 15 },
    movementEasing:       { default: 20 },
    movementAcceleration: { default: 65 },
  },
  init: function () {
    this.velocity = new THREE.Vector3();
  },
  remove: function () {},
  update: (function () {
    var tPrev = Date.now();
    return function () {
      var t = Date.now();
      this.tick(t, t - tPrev);
      tPrev = t;
    };
  }()),

  tick: function (t, dt) {
    // Update rotation.
    this.updateRotation(dt);

    // Update velocity.
    if (dt > MAX_DELTA) {
      // If FPS drops too low, reset the velocity.
      this.velocity.set(0, 0, 0);
      this.el.setAttribute('velocity', this.velocity);
    } else {
      this.updatePosition(dt);
    }    
  },

  updateRotation: function (dt) {
    var control, rotationControls,
        rotation, dRotation,
        data;

    rotationControls = data.rotationControls.split(' ');
    for (var i = 0, l = data.rotationControls.length; i < l; i++) {
      control = this.el.components[data.rotationControls[i]];
      if (control && control.isEnabled()) {
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

  updateVelocity: function (dt) {
    var control, movementControls,
        velocity, dVelocity,
        data;

    movementControls = data.movementControls.split(' ');
    for (var i = 0, l = data.movementControls.length; i < l; i++) {
      control = this.el.components[data.movementControls[i]];
      if (control && control.isEnabled()) {
        if (control.getVelocityDelta) {
          velocity = this.el.getAttribute('velocity');
          dVelocity = control.getVelocityDelta(dt);
          this.velocity.set(velocity.x + dVelocity.x, velocity.y + dVelocity.y, velocity.z + dVelocity.z);
          if (this.velocity.lengthSq() > data.movementSpeed * data.movementSpeed) {
            this.velocity.setLength(data.movementSpeed);
          }
          this.el.setAttribute('velocity', this.velocity);
        } else if (control.getVelocity) {
          this.velocity.copy(control.getVelocity());
          this.el.setAttribute('velocity', this.velocity);
        } else {
          console.error('Invalid movement controls: %s', data.movementControls[i]);
        }
        break;
      }
    }
  }
};