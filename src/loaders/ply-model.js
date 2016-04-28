/**
 * ply-model
 *
 * Wraps THREE.PLYLoader.
 */
THREE.PLYLoader = require('../../lib/PLYLoader');

module.exports = {
  schema: {src: { type: 'src' }},

  init: function () {
    this.model = null;
  },

  update: function () {
    var loader,
        data = this.data;

    if (!data.src) return;

    this.remove();
    loader = new THREE.PLYLoader();
    loader.load(data.src, this.load.bind(this));
  },

  load: function (geometry) {
    this.model = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      shading: THREE.FlatShading,
      vertexColors: THREE.VertexColors,
      shininess: 0
    }));
    this.el.setObject3D('mesh', this.model);
    this.el.emit('model-loaded', {format: 'ply', model: this.model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
};
