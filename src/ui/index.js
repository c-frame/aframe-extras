module.exports = {
  'ui-button':      require('./ui-button'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    if (!AFRAME.components['ui-button']) AFRAME.registerComponent('ui-button', this['ui-button']);

    this._registered = true;
  }
};
