const fetchScript = require('../../lib/fetch-script')();

const LOADER_SRC = 'https://rawgit.com/mrdoob/three.js/r86/examples/js/loaders/GLTFLoader.js';

const loadLoader = (function () {
  let promise;
  return function () {
    promise = promise || fetchScript(LOADER_SRC);
    return promise;
  };
}());

/**
 * Legacy loader for glTF 1.0 models.
 * Asynchronously loads THREE.GLTFLoader from rawgit.
 */
module.exports = AFRAME.registerComponent('gltf-model-legacy', {
  schema: {type: 'model'},

  init: function () {
    this.model = null;
    this.loader = null;
    this.loaderPromise = loadLoader().then(() => {
      this.loader = new THREE.GLTFLoader();
      this.loader.setCrossOrigin('Anonymous');
    });
  },

  update: function () {
    const self = this;
    const el = this.el;
    const src = this.data;

    if (!src) { return; }

    this.remove();

    this.loaderPromise.then(() => {
      this.loader.load(src, function gltfLoaded (gltfModel) {
        self.model = gltfModel.scene;
        self.model.animations = gltfModel.animations;
        el.setObject3D('mesh', self.model);
        el.emit('model-loaded', {format: 'gltf', model: self.model});
      });
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});
