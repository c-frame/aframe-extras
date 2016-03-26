module.exports = {
  'velocity':   require('./velocity'),
  'quaternion': require('./quaternion'),
  registerAll: function (AFRAME) {
    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('velocity',   this['velocity']);
    AFRAME.registerComponent('quaternion', this['quaternion']);
  }
};
