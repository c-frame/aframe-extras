var fetchScript = require('../../lib/fetch-script')();

var LOADER_SRC = 'https://rawgit.com/mrdoob/three.js/dev/examples/js/loaders/GLTF2Loader.js';

// Monkeypatch while waiting for three.js r86.
if (THREE.PropertyBinding.sanitizeNodeName === undefined) {

  THREE.PropertyBinding.sanitizeNodeName = function (s) { return s; };

}

/**
 * Upcoming (and NOT YET STABLE) loader for glTF 2.0 models.
 * Pulls THREE.GLTF2Loader directly from three.js 'dev' branch.
 */
module.exports = {
  schema: {type: 'model'},

  init: function () {
    this.model = null;
    this.loader = null;
    this.loaderPromise = loadLoader().then(function () {
      this.loader = new THREE.GLTF2Loader();
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
        el.setObject3D('mesh', self.model);
        el.emit('model-loaded', {format: 'gltf', model: self.model});
      });
    }.bind(this));
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
};

var loadLoader = (function () {
  var promise;
  return function () {
    promise = promise || fetchScript(LOADER_SRC);
    return promise;
  };
}());
