module.exports = {
  init: function () {
    this.dVelocity = new THREE.Vector3();

    this.listeners = {
      touchstart: function () { this.isMoving = true; }.bind(this),
      touchend: function () { this.isMoving = false; }.bind(this),
    };

    window.addEventListener('touchstart', this.listeners.touchstart);
    window.addEventListener('touchend', this.listeners.touchend);
  },

  remove: function () {
    window.removeEventListener('touchstart', this.listeners.touchstart);
    window.removeEventListener('touchend', this.listeners.touchend);
  },

  update: function () {},
  tick: function () {},

  isMovementActive: function () { return this.isMoving; },
  getMovementDelta: function () {
    this.dVelocity.z = this.isMoving ? -1 : 0;
    return this.dVelocity.clone();
  }
};
