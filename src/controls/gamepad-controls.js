/**
 * Gamepad controls for A-Frame.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-gamepad-controls
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */

import GamepadButton from '../../lib/GamepadButton.js';
import GamepadButtonEvent from '../../lib/GamepadButtonEvent.js';

const JOYSTICK_EPS = 0.2;

const Hand = {
  LEFT: 'left',
  RIGHT: 'right'
};

const Joystick = {
  MOVEMENT: 1,
  ROTATION: 2
};

AFRAME.registerComponent('gamepad-controls', {

  /*******************************************************************
   * Statics
   */

  GamepadButton: GamepadButton,

  /*******************************************************************
   * Schema
   */

  schema: {
    // Enable/disable gamepad-controls
    enabled: { default: true },

    // Rotation sensitivity
    rotationSensitivity: { default: 2.0 },
  },

  /*******************************************************************
   * Core
   */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    const sceneEl = this.el.sceneEl;

    // tracked-controls-webxr was renamed to tracked-controls in aframe 1.7.0
    // tracked-controls-webxr is for aframe 1.6.0 and below
    this.system = sceneEl.systems['tracked-controls'] || sceneEl.systems['tracked-controls-webxr'] || {controllers: []};

    this.prevTime = window.performance.now();

    // Button state
    this.buttons = {};

    // Rotation
    const rotation = this.el.object3D.rotation;
    this.pitch = new THREE.Object3D();
    this.pitch.rotation.x = rotation.x;
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.rotation.y = rotation.y;
    this.yaw.add(this.pitch);

    this._lookVector = new THREE.Vector2();
    this._moveVector = new THREE.Vector2();
    this._dpadVector = new THREE.Vector2();

    sceneEl.addBehavior(this);
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function () { this.tick(); },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function (t, dt) {
    this.updateButtonState();
    this.updateRotation(dt);
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /*******************************************************************
   * Movement
   */

  isVelocityActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    const dpad = this._dpadVector;
    const joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    const inputX = dpad.x || joystick.x;
    const inputY = dpad.y || joystick.y;

    return Math.abs(inputX) > JOYSTICK_EPS || Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function () {
    const dpad = this._dpadVector;
    const joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    const inputX = dpad.x || joystick.x;
    const inputY = dpad.y || joystick.y;
    const dVelocity = new THREE.Vector3();

    if (Math.abs(inputX) > JOYSTICK_EPS) {
      dVelocity.x += inputX;
    }
    if (Math.abs(inputY) > JOYSTICK_EPS) {
      dVelocity.z += inputY;
    }

    return dVelocity;
  },

  /*******************************************************************
   * Rotation
   */

  isRotationActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    const joystick = this._lookVector;

    this.getJoystick(Joystick.ROTATION, joystick);

    return Math.abs(joystick.x) > JOYSTICK_EPS || Math.abs(joystick.y) > JOYSTICK_EPS;
  },

  updateRotation: function (dt) {
    if (!this.isRotationActive()) return;

    const data = this.data;
    const yaw = this.yaw;
    const pitch = this.pitch;

    // First copy camera rig pitch/yaw, it may have been changed from
    // another component.
    yaw.rotation.y = this.el.object3D.rotation.y;
    pitch.rotation.x = this.el.object3D.rotation.x;

    const lookVector = this._lookVector;

    this.getJoystick(Joystick.ROTATION, lookVector);

    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;

    lookVector.multiplyScalar(data.rotationSensitivity * dt / 1000);
    yaw.rotation.y -= lookVector.x;
    pitch.rotation.x -= lookVector.y;
    pitch.rotation.x = Math.max(- Math.PI / 2, Math.min(Math.PI / 2, pitch.rotation.x));
    this.el.object3D.rotation.set(pitch.rotation.x, yaw.rotation.y, 0);
  },

  /*******************************************************************
   * Button events
   */

  updateButtonState: function () {
    const gamepad = this.getGamepad(Hand.RIGHT);
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

    } else {
      // Reset state if controls are disabled or controller is lost.
      for (const key in this.buttons) { this.buttons[key] = false; }
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
   * @param {string} handPreference
   * @return {Gamepad}
   */
  getGamepad: (function () {
    const _xrGamepads = [];
    const _empty = [];

    return function (handPreference) {
      // https://github.com/donmccurdy/aframe-proxy-controls
      const proxyControls = this.el.sceneEl.components['proxy-controls'];
      const proxyGamepad = proxyControls && proxyControls.isConnected()
        && proxyControls.getGamepad(0);
      if (proxyGamepad) return proxyGamepad;

      // https://www.w3.org/TR/webxr/#dom-xrinputsource-handedness
      _xrGamepads.length = 0;
      for (let i = 0; i < this.system.controllers.length; i++) {
        const xrController = this.system.controllers[i];
        const xrGamepad = xrController ? xrController.gamepad : null;
        _xrGamepads.push(xrGamepad);
        if (xrGamepad && xrController.handedness === handPreference) return xrGamepad;
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/hand
      const navGamepads = navigator.getGamepads ? navigator.getGamepads() : _empty;
      for (let i = 0; i < navGamepads.length; i++) {
        const navGamepad = navGamepads[i];
        if (navGamepad && navGamepad.hand === handPreference) return navGamepad;
      }

      return _xrGamepads[0] || navGamepads[0];
    };
  })(),

  /**
   * Returns the state of the given button.
   * @param  {number} index The button (0-N) for which to find state.
   * @return {GamepadButton}
   */
  getButton: function (index) {
    return this.getGamepad(Hand.RIGHT).buttons[index];
  },

  /**
   * Returns state of the given axis. Axes are labelled 0-N, where 0-1 will
   * represent X/Y on the first joystick, and 2-3 X/Y on the second.
   * @param  {number} index The axis (0-N) for which to find state.
   * @return {number} On the interval [-1,1].
   */
  getAxis: function (index) {
    return this.getGamepad(index > 1 ? Hand.RIGHT : Hand.LEFT).axes[index];
  },

  /**
   * Returns the state of the specified joystick as a THREE.Vector2.
   * @param  {Joystick} role
   * @param  {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getJoystick: function (index, target) {
    const gamepad = this.getGamepad(index === Joystick.MOVEMENT ? Hand.LEFT : Hand.RIGHT);
    // gamepad can be null here if it becomes disconnected even if isConnected() was called
    // in the same tick before calling getJoystick.
    if (!gamepad) {
      return target.set(0, 0);
    }
    if (gamepad.mapping === 'xr-standard') {
      // See: https://github.com/donmccurdy/aframe-extras/issues/307
      switch (index) {
        case Joystick.MOVEMENT: return target.set(gamepad.axes[2], gamepad.axes[3]);
        case Joystick.ROTATION: return target.set(gamepad.axes[2], 0);
      }
    } else {
      switch (index) {
        case Joystick.MOVEMENT: return target.set(gamepad.axes[0], gamepad.axes[1]);
        case Joystick.ROTATION: return target.set(gamepad.axes[2], gamepad.axes[3]);
      }
    }
    throw new Error('Unexpected joystick index "%d".', index);
  },

  /**
   * Returns the state of the dpad as a THREE.Vector2.
   * @param {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getDpad: function (target) {
    const gamepad = this.getGamepad(Hand.LEFT);
    if (!gamepad) {
      return target.set(0, 0);
    }
    if (!gamepad.buttons[GamepadButton.DPAD_RIGHT]) {
      return target.set(0, 0);
    }
    return target.set(
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
    const gamepad = this.getGamepad(Hand.LEFT);
    return !!(gamepad && gamepad.connected);
  },

  /**
   * Returns a string containing some information about the controller. Result
   * may vary across browsers, for a given controller.
   * @return {string}
   */
  getID: function () {
    return this.getGamepad(Hand.LEFT).id;
  }
});
