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

    // Button state
    this.buttons = {};

    scene.addBehavior(this);
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function () { this.tick(); },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function () {
    this.updateButtonState();
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /*******************************************************************
   * Universal controls - movement
   */

  isVelocityActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    var dpad = this.getDpad(),
        joystick0 = this.getJoystick(0),
        inputX = dpad.x || joystick0.x,
        inputY = dpad.y || joystick0.y;

    return Math.abs(inputX) > JOYSTICK_EPS || Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function () {
    var dpad = this.getDpad(),
        joystick0 = this.getJoystick(0),
        inputX = dpad.x || joystick0.x,
        inputY = dpad.y || joystick0.y,
        dVelocity = new THREE.Vector3();

    if (Math.abs(inputX) > JOYSTICK_EPS) {
      dVelocity.x += inputX;
    }
    if (Math.abs(inputY) > JOYSTICK_EPS) {
      dVelocity.z += inputY;
    }

    return dVelocity;
  },

  /*******************************************************************
   * Universal controls - rotation
   */

  isRotationActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    var joystick1 = this.getJoystick(1);

    return Math.abs(joystick1.x) > JOYSTICK_EPS || Math.abs(joystick1.y) > JOYSTICK_EPS;
  },

  getRotationDelta: function () {
    var lookVector = this.getJoystick(1);
    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;
    return lookVector;
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
