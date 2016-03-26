module.exports = {
  'shadow':       require('./shadow'),
  'shadow-light': require('./shadow-light'),
  registerAll: function (AFRAME) {
    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('shadow',        this['shadow']);
    AFRAME.registerComponent('shadow-light',  this['shadow-light']);
  }
};
