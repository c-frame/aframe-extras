/**
 * object-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two different THREE.js formats,
 * both having the .json extension. This loader supports only THREE.ObjectLoader, which typically
 * includes multiple meshes or an entire scene.
 *
 * Check the console for errors, if in doubt. You may need to use `json-model` or
 * `blend-character-model` for some .js and .json files.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */
AFRAME.registerComponent('object-model', {
  schema: {
    src:         { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    let loader;
    const data = this.data;
    if (!data.src) return;

    this.remove();
    loader = new THREE.ObjectLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, (object) => {

      // Enable skinning, if applicable.
      object.traverse((o) => {
        if (o instanceof THREE.SkinnedMesh && o.material) {
          o.material.skinning = !!((o.geometry && o.geometry.bones) || []).length;
        }
      });

      this.load(object);
    });
  },

  load: function (model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'json', model: model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
});
