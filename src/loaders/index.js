module.exports = {
  'animation-mixer': require('./animation-mixer'),
  'json-model': require('./json-model'),
  'object-model': require('./object-model'),
  'ply-model': require('./ply-model'),
  'three-model': require('./three-model'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    // THREE.AnimationMixer
    if (!AFRAME.components['animation-mixer']) {
      AFRAME.registerComponent('animation-mixer', this['animation-mixer']);
    }

    // THREE.PlyLoader
    if (!AFRAME.systems['ply-model']) {
      AFRAME.registerSystem('ply-model', this['ply-model'].System);
    }
    if (!AFRAME.components['ply-model']) {
      AFRAME.registerComponent('ply-model', this['ply-model'].Component);
    }

    // THREE.JsonLoader
    if (!AFRAME.components['json-model']) {
      AFRAME.registerComponent('json-model', this['json-model']);
    }

    // THREE.ObjectLoader
    if (!AFRAME.components['object-model']) {
      AFRAME.registerComponent('object-model', this['object-model']);
    }

    // (deprecated) THREE.JsonLoader and THREE.ObjectLoader
    if (!AFRAME.components['three-model']) {
      AFRAME.registerComponent('three-model', this['three-model']);
    }

    this._registered = true;
  }
};
