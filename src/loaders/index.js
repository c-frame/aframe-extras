module.exports = {
  'fbx-model':   require('./fbx-model'),
  'three-model': require('./three-model'),
  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('fbx-model',   this['fbx-model']);
    AFRAME.registerComponent('three-model', this['three-model']);

    this._registered = true;
  }
};
