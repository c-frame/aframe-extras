module.exports = {
  'velocity':   require('./velocity'),
  'quaternion': require('./quaternion'),
  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('velocity',   this.velocity);
    AFRAME.registerComponent('quaternion', this.quaternion);

    this._registered = true;
  }
};
