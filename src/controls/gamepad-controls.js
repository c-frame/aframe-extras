/**
 * Gamepad controls for A-Frame.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-gamepad-controls
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */

var GamepadButton = require('../../lib/GamepadButton'),
    GamepadButtonEvent = require('../../lib/GamepadButtonEvent');

var MAX_DELTA = 0.2,
    PI_2 = Math.PI / 2;

var JOYSTICK_EPS = 0.2;

module.exports = {

  /*******************************************************************
   * Statics
   */

  GamepadButton: GamepadButton,

  /*******************************************************************
   * Schema
   */

  schema: {
    // Controller 0-3
    controller:        { default: 0, oneOf: [0, 1, 2, 3] },

    // Enable/disable features
    enabled:           { default: true },
    movementEnabled:   { default: true },
    lookEnabled:       { default: true },
    flyEnabled:        { default: false },

    // Constants
    easing:            { default: 20 },
    acceleration:      { default: 65 },
    sensitivity:       { default: 0.04 },

    // Control axes
    pitchAxis:         { default: 'x', oneOf: [ 'x', 'y', 'z' ] },
    yawAxis:           { default: 'y', oneOf: [ 'x', 'y', 'z' ] },
    rollAxis:          { default: 'z', oneOf: [ 'x', 'y', 'z' ] },

    // Debugging
    debug:             { default: false }
  },

  /*******************************************************************
   * Core
   */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    var scene = this.el.sceneEl;
    this.prevTime = window.performance.now();

    // Movement
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.direction = new THREE.Vector3(0, 0, 0);

    // Rotation
    this.pitch = new THREE.Object3D();
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.add(this.pitch);

    // Button state
    this.buttons = {};

    scene.addBehavior(this);

    if (!this.getGamepad()) {
      console.warn(
        'Gamepad #%d not found. Connect controller and press any button to continue.',
        this.data.controller
      );
    }
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (previousData) {
    this.updateRotation();
    this.updatePosition(!!previousData);
    this.updateButtonState();
  },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function () {
    this.updateRotation();
    this.updatePosition();
    this.updateButtonState();
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /*******************************************************************
   * Movement
   */
  
  isEnabled: function () {
  	return false;
  },
  
  getVelocityDelta: function (dt) {

  },

  getRotationDelta: function (dt) {

  },

  updatePosition: function (reset) {
    // var data = this.data;
    // var acceleration = data.acceleration;
    // var easing = data.easing;
    // var velocity = this.velocity;
    // var time = window.performance.now();
    // var delta = (time - this.prevTime) / 1000;
    // var rollAxis = data.rollAxis;
    // var pitchAxis = data.pitchAxis;
    // var el = this.el;
    // var gamepad = this.getGamepad();
    // this.prevTime = time;

    // // If data has changed or FPS is too low
    // // we reset the velocity
    // if (reset || delta > MAX_DELTA) {
    //   velocity[rollAxis] = 0;
    //   velocity[pitchAxis] = 0;
    //   return;
    // }

    // velocity[rollAxis] -= velocity[rollAxis] * easing * delta;
    // velocity[pitchAxis] -= velocity[pitchAxis] * easing * delta;

    // var position = el.getComputedAttribute('position');

    // if (data.enabled && data.movementEnabled && gamepad) {
    //   var dpad = this.getDpad(),
    //       inputX = dpad.x || this.getJoystick(0).x,
    //       inputY = dpad.y || this.getJoystick(0).y;
    //   if (Math.abs(inputX) > JOYSTICK_EPS) {
    //     velocity[pitchAxis] += inputX * acceleration * delta;
    //   }
    //   if (Math.abs(inputY) > JOYSTICK_EPS) {
    //     velocity[rollAxis] += inputY * acceleration * delta;
    //   }
    // }

    // var movementVector = this.getMovementVector(delta);

    // el.object3D.translateX(movementVector.x);
    // el.object3D.translateY(movementVector.y);
    // el.object3D.translateZ(movementVector.z);

    // el.setAttribute('position', {
    //   x: position.x + movementVector.x,
    //   y: position.y + movementVector.y,
    //   z: position.z + movementVector.z
    // });
  },

  getMovementVector: function (delta) {
    // if (this._getMovementVector) {
    //   return this._getMovementVector(delta);
    // }

    // var rotation = new THREE.Euler(0, 0, 0, 'YXZ');

    // this._getMovementVector = function (delta) {
    //   var elRotation = this.el.getAttribute('rotation');
    //   this.direction.copy(this.velocity);
    //   this.direction.multiplyScalar(delta);
    //   if (!elRotation) { return this.direction; }
    //   if (!this.data.flyEnabled) { elRotation.x = 0; }
    //   rotation.set(
    //     THREE.Math.degToRad(elRotation.x),
    //     THREE.Math.degToRad(elRotation.y),
    //     0
    //   );
    //   this.direction.applyEuler(rotation);
    //   return this.direction;
    // };

    // return this._getMovementVector(delta);
  },

  /*******************************************************************
   * Rotation
   */
  
  updateRotation: function () {
    // if (this._updateRotation) {
    //   return this._updateRotation();
    // }

    // var initialRotation = new THREE.Vector3(),
    //     prevInitialRotation = new THREE.Vector3(),
    //     prevFinalRotation = new THREE.Vector3();

    // var tCurrent,
    //     tLastLocalActivity = 0,
    //     tLastExternalActivity = 0;

    // var ROTATION_EPS = 0.0001,
    //     DEBOUNCE = 500;

    // this._updateRotation = function () {
    //   if (!this.data.lookEnabled || !this.getGamepad()) {
    //     return;
    //   }

    //   tCurrent = Date.now();
    //   initialRotation.copy(this.el.getAttribute('rotation') || initialRotation);

    //   // If initial rotation for this frame is different from last frame, and
    //   // doesn't match last gamepad state, assume an external component is
    //   // active on this element.
    //   if (initialRotation.distanceToSquared(prevInitialRotation) > ROTATION_EPS
    //       && initialRotation.distanceToSquared(prevFinalRotation) > ROTATION_EPS) {
    //     prevInitialRotation.copy(initialRotation);
    //     tLastExternalActivity = tCurrent;
    //     return;
    //   }

    //   prevInitialRotation.copy(initialRotation);

    //   // If external controls have been active in last 500ms, wait.
    //   if (tCurrent - tLastExternalActivity < DEBOUNCE) {
    //     return;
    //   }

    //   var lookVector = this.getJoystick(1);
    //   if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    //   if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;
      
    //   // If external controls have been active more recently than gamepad,
    //   // and gamepad hasn't moved, don't overwrite the existing rotation.
    //   if (tLastExternalActivity > tLastLocalActivity && !lookVector.lengthSq()) {
    //     return;
    //   }

    //   lookVector.multiplyScalar(this.data.sensitivity);
    //   this.yaw.rotation.y -= lookVector.x;
    //   this.pitch.rotation.x -= lookVector.y;
    //   this.pitch.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitch.rotation.x));

    //   this.el.setAttribute('rotation', {
    //     x: THREE.Math.radToDeg(this.pitch.rotation.x),
    //     y: THREE.Math.radToDeg(this.yaw.rotation.y),
    //     z: 0
    //   });
    //   prevFinalRotation.copy(this.el.getAttribute('rotation'));
    //   tLastLocalActivity = tCurrent;
    // };

    // return this._updateRotation();
  },

  /*******************************************************************
   * Button events
   */

  updateButtonState: function () {
    var gamepad = this.getGamepad();
    if (this.data.enabled && gamepad) {

      // Fire DOM events for button state changes.
      for (var i = 0; i < gamepad.buttons.length; i++) {
        if (gamepad.buttons[i].pressed && !this.buttons[i]) {
          this.emit(new GamepadButtonEvent('gamepadbuttondown', i, gamepad.buttons[i]));
        } else if (!gamepad.buttons[i].pressed && this.buttons[i]) {
          this.emit(new GamepadButtonEvent('gamepadbuttonup', i, gamepad.buttons[i]));
        }
        this.buttons[i] = gamepad.buttons[i].pressed;
      }

    } else if (Object.keys(this.buttons)) {
      // Reset state if controls are disabled or controller is lost.
      this.buttons = {};
    }
  },

  emit: function (event) {
    // Emit original event.
    this.el.emit(event.type, event);

    // Emit convenience event, identifying button index.
    this.el.emit(
      event.type + ':' + event.index,
      new GamepadButtonEvent(event.type, event.index, event)
    );
  },

  /*******************************************************************
   * Gamepad state
   */

  /**
   * Returns the Gamepad instance attached to the component. If connected,
   * a proxy-controls component may provide access to Gamepad input from a
   * remote device.
   *
   * @return {Gamepad}
   */
  getGamepad: function () {
    var localGamepad = navigator.getGamepads
          && navigator.getGamepads()[this.data.controller],
        proxyControls = this.el.sceneEl.components['proxy-controls'],
        proxyGamepad = proxyControls && proxyControls.isConnected()
          && proxyControls.getGamepad(this.data.controller);
    return proxyGamepad || localGamepad;
  },

  /**
   * Returns the state of the given button.
   * @param  {number} index The button (0-N) for which to find state.
   * @return {GamepadButton} 
   */
  getButton: function (index) {
    return this.getGamepad().buttons[index];
  },

  /**
   * Returns state of the given axis. Axes are labelled 0-N, where 0-1 will
   * represent X/Y on the first joystick, and 2-3 X/Y on the second.
   * @param  {number} index The axis (0-N) for which to find state.
   * @return {number} On the interval [-1,1].
   */
  getAxis: function (index) {
    return this.getGamepad().axes[index];
  },

  /**
   * Returns the state of the given joystick (0 or 1) as a THREE.Vector2.
   * @param  {number} id The joystick (0, 1) for which to find state.
   * @return {THREE.Vector2}
   */
  getJoystick: function (index) {
    var gamepad = this.getGamepad();
    switch (index) {
      case 0: return new THREE.Vector2(gamepad.axes[0], gamepad.axes[1]);
      case 1: return new THREE.Vector2(gamepad.axes[2], gamepad.axes[3]);
      default: throw new Error('Unexpected joystick index "%d".', index);
    }
  },

  /**
   * Returns the state of the dpad as a THREE.Vector2.
   * @return {THREE.Vector2}
   */
  getDpad: function () {
    var gamepad = this.getGamepad();
    if (!gamepad.buttons[GamepadButton.DPAD_RIGHT]) {
      return new THREE.Vector2();
    }
    return new THREE.Vector2(
      (gamepad.buttons[GamepadButton.DPAD_RIGHT].pressed ? 1 : 0)
      + (gamepad.buttons[GamepadButton.DPAD_LEFT].pressed ? -1 : 0),
      (gamepad.buttons[GamepadButton.DPAD_UP].pressed ? -1 : 0)
      + (gamepad.buttons[GamepadButton.DPAD_DOWN].pressed ? 1 : 0)
    );
  },

  /**
   * Returns true if the gamepad is currently connected to the system.
   * @return {boolean}
   */
  isConnected: function () {
    var gamepad = this.getGamepad();
    return !!(gamepad && gamepad.connected);
  },

  /**
   * Returns a string containing some information about the controller. Result
   * may vary across browsers, for a given controller.
   * @return {string}
   */
  getID: function () {
    return this.getGamepad().id;
  }
};