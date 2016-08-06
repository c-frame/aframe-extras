module.exports = {
  'shadow':       require('./shadow'),
  'shadow-light': require('./shadow-light'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    if (!AFRAME.components['shadow'])       AFRAME.registerComponent('shadow',        this['shadow']);
    if (!AFRAME.components['shadow-light']) AFRAME.registerComponent('shadow-light',  this['shadow-light']);

    this._registered = true;
  }
};
