module.exports = {
  init: function () {
    this.dVelocity = new THREE.Vector3();

    this.listeners = {
      touchstart: function (e) { this.isMoving = true; e.preventDefault(); }.bind(this),
      touchend: function (e) { this.isMoving = false; e.preventDefault(); }.bind(this),
    };

    var sceneEl = this.el.sceneEl,
        canvasEl = sceneEl && sceneEl.canvas;

    canvasEl.addEventListener('touchstart', this.listeners.touchstart);
    canvasEl.addEventListener('touchend', this.listeners.touchend);
  },

  remove: function () {
    var sceneEl = this.el.sceneEl,
        canvasEl = sceneEl && sceneEl.canvas;

    if (!canvasEl) return;

    canvasEl.removeEventListener('touchstart', this.listeners.touchstart);
    canvasEl.removeEventListener('touchend', this.listeners.touchend);
  },

  update: function () {},
  tick: function () {},

  isMovementActive: function () { return this.isMoving; },
  getMovementDelta: function () {
    this.dVelocity.z = this.isMoving ? -1 : 0;
    return this.dVelocity.clone();
  }
};
