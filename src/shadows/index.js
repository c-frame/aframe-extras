module.exports = {
  'shadow':       require('./shadow'),
  'shadow-light': require('./shadow-light'),
  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('shadow',        this['shadow']);
    AFRAME.registerComponent('shadow-light',  this['shadow-light']);

    this._registered = true;
  }
};
