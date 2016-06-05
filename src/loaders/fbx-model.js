/**
 * three-model
 *
 * Wraps THREE.FBXLoader, and therefore has the same feature support:
 *
 * Loads FBX file in *ASCII and version 7 format.
 *
 * Supported
 *  - mesh
 *  - skinning
 *  - normal / uv
 *
 * Not Supported
 *  - material
 *  - texture
 *  - morph
 */
THREE.FBXLoader = require('../../lib/FBXLoader');

module.exports = {
  schema: {src: { type: 'src' }},

  init: function () {
    this.model = null;
  },

  update: function () {
    var loader,
        data = this.data;

    if (!data.src) {
      console.warn('[%s] `src` property is required.', this.name);
      return;
    }

    this.remove();
    loader = new THREE.FBXLoader();
    loader.load(data.src, this.load.bind(this));
  },

  load: function (model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'fbx', model: model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
};
