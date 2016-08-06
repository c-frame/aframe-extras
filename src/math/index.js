module.exports = {
  'velocity':   require('./velocity'),
  'quaternion': require('./quaternion'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    if (!AFRAME.components['velocity'])    AFRAME.registerComponent('velocity',   this.velocity);
    if (!AFRAME.components['quaternion'])  AFRAME.registerComponent('quaternion', this.quaternion);

    this._registered = true;
  }
};
