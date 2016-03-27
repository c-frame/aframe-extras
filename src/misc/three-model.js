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
    loader:         { default: 'object', oneOf: ['object', 'json'] }
  },

  init: function () {
    this.model = null;
    this.objectLoader = new THREE.ObjectLoader();
    this.jsonLoader = new THREE.JSONLoader();
  },

  update: function () {
    var data = this.data;
    if (!data.src) return;

    this.remove();

    if (data.loader === 'object') {
      this.objectLoader.load(data.src, this.load.bind(this));
    } else if (data.loader === 'json') {
      this.jsonLoader.load(data.src, this.load.bind(this));
    } else {
      throw new Error('[three-model] Invalid mode "%s".', data.mode);
    }
  },

  load: function (jsonModel) {
    this.model = jsonModel;
    this.el.setObject3D('mesh', jsonModel);
    this.el.emit('model-loaded', {format: 'three', model: jsonModel});
  },

  remove: function () {
    if (!this.model) return;
    this.el.removeObject3D('mesh');
  }
};
