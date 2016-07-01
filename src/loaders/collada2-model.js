var ColladaLoader2 = require('../../lib/ColladaLoader2');

/**
 * three-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two
 * different THREE.js formats, both having the .json extension. This loader
 * supports both, but requires you to specify the mode as "object" or "json".
 *
 * Typically, you will use "json" for a single mesh, and "object" for a scene
 * or multiple meshes. Check the console for errors, if in doubt.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */
module.exports = {
  schema: {
    src:          { type: 'src' },
    animation:    { default: '' }
  },

  init: function () {
    this.model = null;
    this.mixer = null;
    this.loader = new ColladaLoader2();
  },

  update: function () {
    var data = this.data;
    if (!data.src) return;

    this.remove();
    this.loader.load(data.src, this.load.bind(this));
  },

  load: function (model) {
    this.model = model.scene;
    this.mixer = new THREE.AnimationMixer(this.model);
    this.el.setObject3D('mesh', this.model);
    this.el.emit('model-loaded', {format: 'collada2', model: this.model});

    if (this.data.animation) this.playAnimation();
  },

  playAnimation: function () {
    var data = this.data,
        animations = this.model.animations || this.model.geometry.animations,
        clip = THREE.AnimationClip.findByName(animations, data.animation);
    this.model.activeAction = this.mixer.clipAction(clip, this.model).play();
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
    if (this.model) this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) {
      this.mixer.update(dt / 1000);
    }
  }
};
