/**
 * Apply this component to models that looks "blocky", to have Three.js compute
 * vertex normals on the fly for a "smoother" look.
 */
module.exports = AFRAME.registerComponent('mesh-smooth', {
  init: function () {
    this.el.addEventListener('model-loaded', (e) => {
      e.detail.model.traverse((node) => {
        if (node.isMesh) node.geometry.computeVertexNormals();
      });
    });
  }
});
