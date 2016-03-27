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
    loader:       { default: 'object', oneOf: ['object', 'json'] },
    animation:    { default: '' }
  },

  init: function () {
    this.model = null;
    this.mixer = null;
  },

  update: function () {
    var loader,
        data = this.data;
    if (!data.src) return;

    this.remove();
    if (data.loader === 'object') {
      loader = new THREE.ObjectLoader();
      loader.load(data.src, this.load.bind(this));
    } else if (data.loader === 'json') {
      loader = new THREE.JSONLoader();
      loader.load(data.src, function (geometry, materials) {
        this.load(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials)));
      }.bind(this));
    } else {
      throw new Error('[three-model] Invalid mode "%s".', data.mode);
    }
  },

  load: function (model) {
    this.model = model;
    this.mixer = new THREE.AnimationMixer(this.model);
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'three', model: model});

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
