module.exports = {
  init: function () {
    this.dVelocity = new THREE.Vector3();

    this.listeners = {
      onpress: function () { this.isMoving = true; }.bind(this),
      onrelease: function () { this.isMoving = false; }.bind(this),
    };

    window.addEventListener('mousedown', this.listeners.onpress);
    window.addEventListener('touchstart', this.listeners.onpress);
    window.addEventListener('mouseup', this.listeners.onrelease);
    window.addEventListener('touchend', this.listeners.onrelease);
  },

  remove: function () {
    window.removeEventListener('mousedown', this.listeners.onpress);
    window.removeEventListener('touchstart', this.listeners.onpress);
    window.removeEventListener('mouseup', this.listeners.onrelease);
    window.removeEventListener('touchend', this.listeners.onrelease);
  },

  update: function () {},
  tick: function () {},

  // Rotation controls interface
  isMovementActive: function () { return this.isMoving; },
  getMovementDelta: function () {
    this.dVelocity.z = this.isMoving ? -1 : 0;
    return this.dVelocity.clone();
  }
};
