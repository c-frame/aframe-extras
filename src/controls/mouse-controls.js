/**
 * Mouse + Pointerlock controls.
 *
 * Based on: https://github.com/aframevr/aframe/pull/1056
 */
module.exports = {

  /*******************************************************************
   * Schema
   */

  schema: {
    enabled: { default: true },
    pointerlockEnabled: { default: true },
    sensitivity: { default: 1 / 25 }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    var canvasEl = this.el.sceneEl.canvas;

    this.mouseDown = false;
    this.pointerLocked = false;
    this.lookVector = new THREE.Vector2();

    this.listeners = {
      mousedown: this.onMouseDown.bind(this),
      mousemove: this.onMouseMove.bind(this),
      mouseup: this.releaseMouse.bind(this),
      mouseout: this.releaseMouse.bind(this),

      pointerlockchange: this.onPointerLockChange.bind(this),
      mozpointerlockchange: this.onPointerLockChange.bind(this),
      pointerlockerror: this.onPointerLockChange.bind(this)
    };

    canvasEl.addEventListener('mousedown', this.listeners.mousedown, false);
    canvasEl.addEventListener('mousemove', this.listeners.mousemove, false);
    canvasEl.addEventListener('mouseup', this.listeners.mouseup, false);
    canvasEl.addEventListener('mouseout', this.listeners.mouseout, false);

    document.addEventListener('pointerlockchange', this.listeners.pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', this.listeners.mozpointerlockchange, false);
    document.addEventListener('pointerlockerror', this.listeners.pointerlockerror, false);
  },

  remove: function () {
    var sceneEl = this.el.sceneEl,
        canvasEl = sceneEl && sceneEl.canvas;

    if (canvasEl) {
      canvasEl.removeEventListener('mousedown', this.listeners.mousedown);
      canvasEl.removeEventListener('mousemove', this.listeners.mousemove);
      canvasEl.removeEventListener('mouseup', this.listeners.mouseup);
      canvasEl.removeEventListener('mouseout', this.listeners.mouseout);
    }

    document.addEventListener('pointerlockchange', this.listeners.pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', this.listeners.mozpointerlockchange, false);
    document.addEventListener('pointerlockerror', this.listeners.pointerlockerror, false);
  },

  /*******************************************************************
   * Tick
   */

  update: function () {},
  tick: function () {},

  /*******************************************************************
   * Universal interface
   */

  isRotationActive: function () {
    return this.data.enabled && (this.mouseDown || this.pointerLocked);
  },

  getRotationDelta: function () {
    var dRotation = this.lookVector.clone().multiplyScalar(this.data.sensitivity);
    this.lookVector.set(0, 0, 0);
    return dRotation;
  },

  /*******************************************************************
   * Mouse events
   */

  onMouseMove: function (event) {
    var previousMouseEvent = this.previousMouseEvent;

    if (!this.data.enabled || !(this.mouseDown || this.pointerLocked)) return;

    this.lookVector.x = event.movementX || event.mozMovementX;
    this.lookVector.y = event.movementY || event.mozMovementY;

    if (this.lookVector.x === undefined || this.lookVector.y === undefined) {
      this.lookVector.x = event.screenX - previousMouseEvent.screenX;
      this.lookVector.y = event.screenY - previousMouseEvent.screenY;
    }

    this.previousMouseEvent = event;
  },

  onMouseDown: function (event) {
    var canvasEl = this.el.sceneEl.canvas;

    this.mouseDown = true;
    this.previousMouseEvent = event;

    if (this.data.pointerlockEnabled && !this.pointerLocked) {
      if (canvasEl.requestPointerLock) {
        canvasEl.requestPointerLock();
      } else if (canvasEl.mozRequestPointerLock) {
        canvasEl.mozRequestPointerLock();
      }
    }
  },

  releaseMouse: function () {
    this.mouseDown = false;
  },

  /*******************************************************************
   * Pointerlock events
   */

  onPointerLockChange: function () {
    this.pointerLocked = !!(document.pointerLockElement || document.mozPointerLockElement);
  },

  onPointerLockError: function () {
    this.pointerLocked = false;
  }
};
