/**
 * json-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two different THREE.js formats,
 * both having the .json extension. This loader supports only THREE.JsonLoader, which typically
 * includes only a single mesh.
 *
 * Check the console for errors, if in doubt. You may need to use `object-model` or
 * `blend-character-model` for some .js and .json files.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */
module.exports = AFRAME.registerComponent('json-model', {
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
    loader = new THREE.JSONLoader();
    if (data.crossorigin) loader.crossOrigin = data.crossorigin;
    loader.load(data.src, (geometry, materials) => {

      // Attempt to automatically detect common material options.
      materials.forEach((mat) => {
        mat.vertexColors = (geometry.faces[0] || {}).color ? THREE.FaceColors : THREE.NoColors;
        mat.skinning = !!(geometry.bones || []).length;
        mat.morphTargets = !!(geometry.morphTargets || []).length;
        mat.morphNormals = !!(geometry.morphNormals || []).length;
      });

      const model = (geometry.bones || []).length
        ? new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials))
        : new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

      this.load(model);
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
