var fetchScript = require('../../lib/fetch-script')();

var LOADER_SRC = 'https://rawgit.com/mrdoob/three.js/r86/examples/js/loaders/GLTFLoader.js';

/**
 * Legacy loader for glTF 1.0 models.
 * Asynchronously loads THREE.GLTFLoader from rawgit.
 */
module.exports.Component = {
  schema: {type: 'model'},

  init: function () {
    this.model = null;
    this.loader = null;
    this.loaderPromise = loadLoader().then(function () {
      this.loader = new THREE.GLTFLoader();
      this.loader.setCrossOrigin('Anonymous');
    }.bind(this));
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data;

    if (!src) { return; }

    this.remove();

    this.loaderPromise.then(function () {
      this.loader.load(src, function gltfLoaded (gltfModel) {
        self.model = gltfModel.scene;
        self.model.animations = gltfModel.animations;
        self.system.registerModel(self.model);
        el.setObject3D('mesh', self.model);
        el.emit('model-loaded', {format: 'gltf', model: self.model});
      });
    }.bind(this));
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
    this.system.unregisterModel(this.model);
  }
};

/**
 * glTF model system.
 */
module.exports.System = {
  init: function () {
    this.models = [];
  },

  /**
   * Updates shaders for all glTF models in the system.
   */
  tick: function () {
    var sceneEl = this.sceneEl;
    if (sceneEl.hasLoaded && this.models.length) {
      THREE.GLTFLoader.Shaders.update(sceneEl.object3D, sceneEl.camera);
    }
  },

  /**
   * Registers a glTF asset.
   * @param {object} gltf Asset containing a scene and (optional) animations and cameras.
   */
  registerModel: function (gltf) {
    this.models.push(gltf);
  },

  /**
   * Unregisters a glTF asset.
   * @param  {object} gltf Asset containing a scene and (optional) animations and cameras.
   */
  unregisterModel: function (gltf) {
    var models = this.models;
    var index = models.indexOf(gltf);
    if (index >= 0) {
      models.splice(index, 1);
    }
  }
};

var loadLoader = (function () {
  var promise;
  return function () {
    promise = promise || fetchScript(LOADER_SRC);
    return promise;
  };
}());
