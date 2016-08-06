module.exports = {
  'ply-model': require('./ply-model'),
  'three-model': require('./three-model'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    if (!AFRAME.systems['ply-model']) {
      AFRAME.registerSystem('ply-model', this['ply-model'].System);
    }
    if (!AFRAME.components['ply-model']) {
      AFRAME.registerComponent('ply-model', this['ply-model'].Component);
    }
    if (!AFRAME.components['three-model']) {
      AFRAME.registerComponent('three-model', this['three-model']);
    }

    this._registered = true;
  }
};
