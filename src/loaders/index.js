module.exports = {
  'animation-mixer': require('./animation-mixer'),
  'fbx-model': require('./fbx-model'),
  'gltf-model-legacy': require('./gltf-model-legacy'),
  'json-model': require('./json-model'),
  'object-model': require('./object-model'),
  'ply-model': require('./ply-model'),

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

    // THREE.FBXLoader
    if (!AFRAME.components['fbx-model']) {
      AFRAME.registerComponent('fbx-model', this['fbx-model']);
    }

    // THREE.GLTFLoader
    if (!AFRAME.components['gltf-model-legacy']) {
      AFRAME.registerComponent('gltf-model-legacy', this['gltf-model-legacy']);
    }

    // THREE.JsonLoader
    if (!AFRAME.components['json-model']) {
      AFRAME.registerComponent('json-model', this['json-model']);
    }

    // THREE.ObjectLoader
    if (!AFRAME.components['object-model']) {
      AFRAME.registerComponent('object-model', this['object-model']);
    }

    this._registered = true;
  }
};
