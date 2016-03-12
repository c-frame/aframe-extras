module.exports = {

  /*******************************************************************
   * Schema
   */

  schema: {
    enabled: { default: true },
    sensitivity: { default: 1 / 25 }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    var sceneEl = this.el.sceneEl,
        canvasEl = sceneEl && sceneEl.canvas;

    this.lookVector = new THREE.Vector2();

    this.listeners = {
      mousedown: this.onMouseDown.bind(this),
      mousemove: this.onMouseMove.bind(this),
      mouseup: this.releaseMouse.bind(this),
      mouseout: this.releaseMouse.bind(this)
    };

    canvasEl.addEventListener('mousedown', this.listeners.mousedown, false);
    canvasEl.addEventListener('mousemove', this.listeners.mousemove, false);
    canvasEl.addEventListener('mouseup', this.listeners.mouseup, false);
    canvasEl.addEventListener('mouseout', this.listeners.mouseout, false);
  },

  remove: function () {
    var sceneEl = this.el.sceneEl,
        canvasEl = sceneEl && sceneEl.canvas;

    if (!canvasEl) return;

    canvasEl.removeEventListener('mousedown', this.listeners.mousedown);
    canvasEl.removeEventListener('mousemove', this.listeners.mousemove);
    canvasEl.removeEventListener('mouseup', this.listeners.mouseup);
    canvasEl.removeEventListener('mouseout', this.listeners.mouseout);
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
    return this.data.enabled && this.mouseDown;
  },

  getRotationDelta: function () {
    return this.lookVector.clone().multiplyScalar(this.data.sensitivity);
  },

  /*******************************************************************
   * Mouse tracking
   */

  onMouseMove: function (event) {
    var previousMouseEvent = this.previousMouseEvent;

    if (!this.mouseDown || !this.data.enabled) { return; }

    this.lookVector.x = event.movementX || event.mozMovementX;
    this.lookVector.y = event.movementY || event.mozMovementY;
    if (this.lookVector.x === undefined || this.lookVector.y === undefined) {
      this.lookVector.x = event.screenX - previousMouseEvent.screenX;
      this.lookVector.y = event.screenY - previousMouseEvent.screenY;
    }

    this.previousMouseEvent = event;
  },

  onMouseDown: function (event) {
    this.mouseDown = true;
    this.previousMouseEvent = event;
  },

  releaseMouse: function () {
    this.mouseDown = false;
  }
};
