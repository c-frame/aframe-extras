module.exports = {
  'collada2-model':   require('./collada2-model'),
  'fbx-model':   require('./fbx-model'),
  'ply-model': require('./ply-model'),
  'three-model': require('./three-model'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    if (!AFRAME.components['collada2-model']) AFRAME.registerComponent('collada2-model', this['collada2-model']);
    if (!AFRAME.components['fbx-model'])      AFRAME.registerComponent('fbx-model',      this['fbx-model']);
    if (!AFRAME.components['ply-model'])      AFRAME.registerComponent('ply-model',      this['ply-model']);
    if (!AFRAME.components['three-model'])    AFRAME.registerComponent('three-model',    this['three-model']);

    this._registered = true;
  }
};
